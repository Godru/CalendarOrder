import jQuery from 'jquery'
import Encoder from './base64.js'

if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (str) {
		return this.indexOf(str) === 0;
	};
}

if (FileReader.prototype.readAsBinaryString === undefined) {
    FileReader.prototype.readAsBinaryString = function (fileData) {
        var binary = "";
        var pt = this;
        var reader = new FileReader();
        reader.onload = function (e) {
            var bytes = new Uint8Array(reader.result);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            //pt.result  - readonly so assign content to another property
            pt.content = binary;
            $(pt).trigger('onload');
        }
        reader.readAsArrayBuffer(fileData);
    }
}

function EffiProtocol(opts) {
	opts = opts || {};
	this.login = opts.login || 'guest';
	this.password = opts.password || (this.login == 'guest' ? '1q2w3e' : '');
	this.host = opts.host || '';
	this.authenticated = false;
	this.event_subscribers = [];
	this.polling = false;

	var context = this;
	var error_axml_re = /<xmlstream><Exception><string>(.*)<\/string><u><int>(\d+)<\/int><\/u><\/Exception><\/xmlstream>/;

	function parseStructure(obj) {
		var result = {};
		for (var i=0; i<obj.children.length; i+=2) {
			var key = obj.children[i].textContent,
				value = parseValue(obj.children[i+1]);
			result[key] = value;
		}
		return result;
	}

	function parseArray(obj) {
		var result = [];
		for (var i=0; i<obj.children.length; i++) {
			result[i] = parseValue(obj.children[i]);
		}
		return result;
	}

	function parseException(obj) {
		let result = {
			ExceptionText: "",
			ErrorCode: undefined
		};
		if (obj.children.length < 1) return result;
		result.ExceptionText = obj.children[0].textContent;
		if (obj.children.length > 1) result.ErrorCode = parseValue(obj.children[1]);
		return result;
	}

	function parseTime(val) {
		let found = val.match(/(\d\d\d\d)(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)/);
		if (found != null) {
			return new Date(parseInt(found[1]), parseInt(found[2])-1, parseInt(found[3]), parseInt(found[4]), parseInt(found[5]), parseInt(found[6]));
		}
		return null;
	}
	function parseDate(val) {
		let found = val.match(/(\d\d\d\d)(\d\d)(\d\d)/);
		if (found != null) {
			return new Date(parseInt(found[1]), parseInt(found[2])-1, parseInt(found[3]));
		}
		return null;
	}

	function parseValue(obj) {
		if (obj == null || null == obj.children[0]) return null;
		var container = obj.children[0];
		if (container.nodeName == 'STRUCTURE') return parseStructure(container);
		else if (container.nodeName == 'ARRAY') return parseArray(container);
		else if (container.nodeName == 'UL' || container.nodeName == 'OPTIONAL' || container.nodeName == 'U') return parseValue(container);
		else if (container.nodeName == 'INT64_T' || container.nodeName == 'INT') return parseInt(container.textContent);
		else if (container.nodeName == 'TIME') return parseTime(container.children[0].textContent);
		else if (container.nodeName == 'ADATE') return parseDate(container.children[0].textContent);
		else if (container.nodeName == 'DECIMAL') return parseFloat(container.textContent);
		else if (container.nodeName == 'DOUBLE') return parseFloat(container.textContent);
		else if (container.nodeName == 'EXCEPTION') return parseException(container);
		else if (container.nodeName == 'VALUE') return parseValue(container);
		else return container.textContent;
		return null;
	}

	function parseAXML(data) {
		var apacket_re = /APacket\(\d+ ,"","","","","",\{"ResponseTo":ul\(0 \)\},(.*)\)/;
		var result = data,
			$xml = jQuery(data);
		if (data.startsWith('APacket')) {
			result = result.replace(apacket_re, '$1');
		}

		var values = $xml.find('APacket > Value');
		if (!values || values.length == 0) {
			if ($xml.length < 2) return;
			return parseValue($xml[1])
		}
		return parseValue(values[values.length-1]);
	}

	function _parse(data, status, xhr) {
		var ct = xhr.getResponseHeader("content-type") || "";
		var res = data;
		if (ct.indexOf('text/xml') > -1) {
			res = parseAXML(data);
		}
		else if (ct.indexOf('application/json') > -1) {
			res = JSON.parse(data);
		}
		return res;
	}
	
	this.auth = function(opts) {
		let login = opts.login || context.login,
			password = opts.password || context.password;
		jQuery.ajax({
			url: context.host + '/auth/login',
			type: 'POST',
			data: "Login=s:"+login+"&Password=s:"+password+"&Lang=s:ru_RU&Skin=s:aquarium&TimeZone=i:-180&",
			dataType: "text",
			success: function (data) {
				context.authenticated = true;
				context.login = login;
				context.password = password;
				if (typeof opts.success != 'undefined') opts.success(data);
			},
			error: function (x, status, error) {
				var responseError = parseAXML(x.responseText);
				console.error(responseError.ErrorCode, responseError.ExceptionText);
				if (typeof opts.error != 'undefined') opts.error(responseError);
				else {
					if (Bugsnag) Bugsnag.notify("Effi auth error", {login: login, responseError: responseError});
					throw responseError;
				}
			}
		});
	}

	this.request = function (opts) {
		let data = opts.data || "dummy=none:&";
		jQuery.ajax({
			url: context.host + opts.url,
			type: 'POST',
			data: data,
			dataType: "text",
			success: function (data, status, xhr) {
				let res = _parse(data, status, xhr);
				if (typeof opts.success != 'undefined') opts.success(res);
			},
			error: function (x, status, error) {
				var responseError = parseAXML(x.responseText);
				console.error(responseError.ErrorCode, responseError.ExceptionText);
				if (responseError.ErrorCode == 101 || responseError.ErrorCode == 100) {
					context.auth({
						success: () => {
							context.request(opts);
						}
					});
				}
				else if (typeof opts.error  != 'undefined') opts.error(responseError);
				else {
					if (Bugsnag) Bugsnag.notify("Effi request error", {data: data, responseError: responseError});
					throw responseError;
				}
			}
		});
	}

	this.pollEvents = function (cnt) {
		cnt = cnt || 0;
		this.polling = true;
		jQuery.ajax({
			url: context.host + '/srv/WWW/WWWWorker/GetEvent',
			type: 'GET',
			success: function (data) {
				context.eventsTimeout = setTimeout(context.pollEvents, 1);
				// console.log('event success:', data);
				let res = parseAXML(data);
				for (let e=0; e<res.length; e++) {
					let event =  res[e];
					// console.log(context.event_subscribers)
					for (let i=0; i<context.event_subscribers.length; i++) {
						let subscr = context.event_subscribers[i];
						if (!subscr.type || subscr.type == '*' || subscr.type == event.Type) {
							subscr.callback(event);
						}
					}
				}
			},
			error: function (x, status, error) {
				var responseError = parseAXML(x.responseText);
				if (!responseError) {
					if (cnt<4) {
						context.eventsTimeout = setTimeout(() => {context.pollEvents(cnt+1)}, 2000);
					} else {
						clearTimeout(context.eventsTimeout);
						console.error("Connection to server lost. ");
					}
					return;
				}
				console.error(cnt, responseError.ErrorCode, responseError.ExceptionText);
				if (cnt<4 && (responseError.ErrorCode == 101 || responseError.ErrorCode == 100)) {
					context.auth({
						success: () => {
							console.log('auth done')
							context.pollEvents(1);
						}	
					});
				}
				else {
					clearTimeout(context.eventsTimeout);
					console.error("Connection to server lost. ");
					if (Bugsnag) Bugsnag.notify("Effi pollEvents error", responseError);
					throw responseError;
				}
			}
		});
	}

	this.subscribe = function (ctx, event_name, callback) {
		if (typeof (event_name) == 'function') {
			event_name = '*';
			callback = event_name;
		}
		this.event_subscribers.push({ctx: ctx, type: event_name, callback: callback});
		if (!this.polling) {
			context.eventsTimeout = setTimeout(context.pollEvents, 1);
		}
	}
	this.unsubscribe = function (ctx, event_name) {
		for (let i=0; i<this.event_subscribers.length; i++) {
			let subscr = this.event_subscribers[i];
			if (subscr.ctx = ctx && (!event_name || event_name == '*' || event_name == subscr.type)) {
				this.event_subscribers.splice(i, 1);
			}
		}
	}

	function delete_cookie(name) {
		document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}

	this.logout = function () {
		clearTimeout(context.eventsTimeout);
		delete_cookie('_1024_sid');
		this.authenticated = false;
	}
}

function paddy(n, p, c) {
	var pad_char = typeof c !== 'undefined' ? c : '0';
	var pad = new Array(1 + p).join(pad_char);
	return (pad + n).slice(-pad.length);
}
function format_effi_date(date) {
	if (date == null) return 'not-a-date';
	return paddy(date.getFullYear(), 4) + paddy(date.getMonth()+1, 2) + paddy(date.getDate(), 2);
}
function format_effi_time(date) {
	if (date == null) return 'not-a-date-time';
	return paddy(date.getFullYear(), 4) + paddy(date.getMonth()+1, 2) + paddy(date.getDate(), 2) + 'T' + 
		paddy(date.getHours(), 2) + paddy(date.getMinutes(), 2) + paddy(date.getSeconds(), 2);
}

function encodeAURLComponent(obj) {
	var serialized = '';
	if (typeof obj == 'undefined' || obj == null) return 'none:&'
	else if (obj.type == 'array' || jQuery.isArray(obj)) {
		let s = '';
		for (let i=0; i<obj.length; i++) {
			let o = obj[i];
			s += encodeAURLComponent(o);
		}
		serialized += 'Value:Array:' + s + '&&';
	}
	else if (obj.type == 'optionalInt') serialized = 'optional:i:' + obj.value + '&&';
	else if (obj.type == 'float' || typeof obj.value == 'float') serialized = 'd:' + obj.value + '&';
	else if (obj.type == 'int' || typeof obj.value == 'number') serialized = 'i:' + obj.value + '&';
	else if (obj.type == 'date' || obj.type == 'ADate') serialized = 'ADate:s:' + format_effi_date(obj.value) + '&&';
	else if (obj.type == 'datetime' || obj.type == 'Time' || obj.value instanceof Date) serialized = 'Time:s:' + format_effi_time(obj.value) + '&&';
	else if (obj.type == 'checkbox') serialized = 's:' + obj.value + '&';
	else if (obj.type == 'optionalString') serialized = 'optional:s:' + obj.value.replace(/ /g, '\\w') + '&&';
	else if (obj.type == 'binary') serialized = 'b:' + Encoder.Base64Encode(Encoder.UTF8Encode(obj.value)) + '&';
	else {
		let v = ((typeof obj.value == 'undefined') ? obj : obj.value);
		serialized = 's:' + v.replace(/ /g, '\\w') + '&';
	}
	return serialized;
}

function encodePlain(obj) {
	let serialized = '';
	if (typeof obj == 'undefined' || obj == null) return 'none:&'
	else if (obj.type == 'optionalInt') serialized = 'optional:i:' + obj.value + '&&';
	else if (obj.type == 'float' || typeof obj.value == 'float') serialized = 'd:' + obj.value + '&';
	else if (typeof obj == 'float') serialized = 'd:' + obj + '&';
	else if (obj.type == 'int' || typeof obj.value == 'number') serialized = 'i:' + obj.value + '&';
	else if (typeof obj == 'number') serialized = 'i:' + obj + '&';
	else if (obj.type == 'date' || obj.type == 'ADate') serialized = 'ADate:s:' + format_effi_date(obj.value) + '&&';
	else if (obj.type == 'datetime' || obj.type == 'Time' || obj.value instanceof Date) serialized = 'Time:s:' + format_effi_time(obj.value) + '&&';
	else if (obj instanceof Date) serialized = 'Time:s:' + format_effi_time(obj) + '&&';
	else if (obj.type == 'checkbox') serialized = 's:' + obj.value + '&';
	else if (obj.type == 'optionalString') serialized = 'optional:s:' + obj.value.replace(/ /g, '\\w') + '&&';
	else if (obj.type == 'binary') serialized = 'b:' + Encoder.Base64Encode(obj.value) + '&';
	else {
		let v = ((typeof obj.value == 'undefined') ? obj : obj.value);
		serialized = 's:' + v.replace(/ /g, '\\w') + '&';
	}
	return serialized;
}
function encodeBlob(file, callback) {
	var reader = new FileReader();

	reader.onload = function(readerEvt) {
		let fdata = (readerEvt ? readerEvt.target.result : reader.content);
		console.log('loaded file size=' + fdata.length);
		let serialized = 'b:' + Encoder.Base64Encode(fdata) + '&';
		callback(serialized);
	};

	reader.readAsBinaryString(file);
}
function encodeBlobFile(file, callback) {
	encodeBlob(file, function(serialized_blob) {
		let serialized = 'BlobFile:' + 
			encodeAURLComponent({value: file.name, type: 'string'}) +
			encodeAURLComponent({value: file.type, type: 'string'}) +
			serialized_blob +
			encodeAURLComponent(null) +
			encodeAURLComponent({value: file.lastModifiedDate, type: 'Time'}) + 
			'&';
		callback(serialized);
	});
}

function reduceSerializationArray(serialized, array, i, callback) {
	if (array.length == 0) {
		callback(serialized);
		return;
	}
	let obj = array.splice(0, 1);
	encodeAURLComponentAsync(serialized, obj[0], function(v) {
		reduceSerializationArray(v, array, ++i, callback);
	});
}
function reduceSerializationStructure(serialized, array, object, i, callback) {
	if (array.length == 0) {
		callback(serialized);
		return;
	}
	let key = array.splice(0, 1);
	let obj = object[key];
	let s = serialized + key + '=';
	encodeAURLComponentAsync(s, obj, function (v) {
		reduceSerializationStructure(v, array, object, ++i, callback);
	});
}

function encodeAURLComponentAsync(serialized, obj, callback) {
	// console.log(obj);
	if (obj.type == 'BlobFile' || obj.value instanceof File) {
		encodeBlobFile(obj.value, function (serialized_file) {
			callback(serialized + serialized_file);
		});
	}
	else if (obj.type == 'Array' || 
			Object.prototype.toString.call(obj) === '[object Array]' ||
			Object.prototype.toString.call(obj) === '[object Array Iterator]') {
		let o = obj.value || obj;
		reduceSerializationArray(serialized + 'Value:Array:', o, 0, function (v) {
			callback(v + '&&')
		});
	}
	else if (obj.type == 'Structure' || 
			(!obj.type && Object.prototype.toString.call(obj) === '[object Object]')) {
		let keys = [];
		let o = obj.value || obj;
		for (let k in o) keys.push(k);
		let s = serialized + 'Value:Structure:';
		reduceSerializationStructure(s, keys, o, 0, function (v) {
			callback(v + '&&')
		});
	}
	else {
		let s3 = encodePlain(obj);
		callback(serialized + s3);
	}
}

function buildParams( prefix, obj, add ) {
	let name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if (rbracket.test( prefix )) {
				// Treat each array item as a scalar.
				add( prefix, v );
			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, add );
			}
		});

	} else if (jQuery.type( obj ) === "object") {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

function serializeAURL(a) {
	var result = '';
	for (var key in a) {
		var o = a[key];
		result += key + "=" + encodeAURLComponent(o);
	}
	return result;
};
function serializeAURLAsync(a, callback) {
	let keys = [];
	for (let k in a) keys.push(k);
	reduceSerializationStructure('', keys, a, 0, callback);
}

function prepareDataList(data) {
	if (!data || data.length == 0) throw "Invalid DataList argument. ";
	const header = data[0];
	let result = {
		header: header,
		data: []
	};
	for (let i=1; i<data.length; i++) {
		let r = data[i],
			row = {};
		for (let c=0; c<r.length; c++) {
			row[header[c]] = r[c];
		}
		result.data.push(row);
	}
	return result;
}


jQuery.fn.extend({
	serializeAURL: function() {
		return serializeAURL( this.serializeTypedArray() );
	},
	serializeTypedArray: function() {
		var rCRLF = /\r?\n/g,
			rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
			rsubmittable = /^(?:input|select|textarea|keygen)/i,
			rcheckableType = /^(?:checkbox|radio)$/i;
		
		function getv(val, type, isArray) {
			type = type || 'string';
			var v = "";
			if (type == 'date') {
				var found = val.match(/(\d\d)\.(\d\d)\.(\d\d\d\d)( (\d\d):(\d\d)(:(\d\d))?)?/);
				if (found != null) {
					// var h = found[5] ? parseInt(found[5]) : undefined, 
					// 	m = found[6] ? parseInt(found[6]) : undefined, 
					// 	s = found[8] ? parseInt(found[8]) : undefined;
					v = new Date(parseInt(found[3]), parseInt(found[2])-1, parseInt(found[1]));
					// console.log(parseInt(found[3]), parseInt(found[2])-1, parseInt(found[1]), h, m, s, '->', v);
				}
				else v = null;
			}
			// else if (type == 'checkbox') 
			else if (type == 'int') v = parseInt(val);
			else if (type == 'checkbox' && !isArray) {
				v = (val == 'on' ? true : false);
			}
			else v = val.replace( rCRLF, "\r\n" );
			return v;
		}

		var list = this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val(),
				type = jQuery( this ).attr('data-type') || this.type,
				isArray = jQuery( this ).attr('data-array') == 'true' || false;

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: getv(val, type, isArray), type: type, isArray: isArray };
					}) :
					{ name: elem.name, value: getv(val, type, isArray), type: type, isArray: isArray };
		}).get();

		var s = {}
		for (var i=0; i<list.length; i++) {
			var o = list[i];
			if (o.isArray || o.name in s) {
				if (!(o.name in s)) s[o.name] = [o];
				else s[o.name].push(o);
			}
			else s[o.name] = o;
		}
		return s;
	}
});

export { EffiProtocol, serializeAURL, serializeAURLAsync, format_effi_date, format_effi_time, prepareDataList };
