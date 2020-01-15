import React from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';
import 'jquery-validation'
import 'bootstrap'
import 'bootstrap-datepicker'
import 'typeahead.js'
import 'select2'
import { EffiProtocol, format_effi_date } from '../../lib/effi_protocol';

if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (str) {
		return this.indexOf(str) === 0;
	};
}

// secret key: 6LcOqT4UAAAAAIa9Cwx7s68g74Kmn1QvWWj8lkgp

class Captcha extends React.Component {
	constructor(props) {
		super(props);

		this.captchaCallback = this.captchaCallback.bind(this);
	}

	captchaCallback() {
		this.refs.hiddenRecaptcha.value = "true";
		jQuery(this.refs.hiddenRecaptcha.form).valid();
	}

	render() {
		window.captchaCallback = this.captchaCallback;
		return (
			<div className="form-group col-sm-12">
				<div class="g-recaptcha" data-sitekey="6LcOqT4UAAAAANx-QZWhsGg7-236KX3WYdoFVirX" data-callback="captchaCallback"></div>
				<input type="hidden" class="hiddenRecaptcha required" name="hiddenRecaptcha" id="hiddenRecaptcha" ref="hiddenRecaptcha" />
			</div>
		)
	}
}

window.IsiaOrder = function(htmlid, baseurl, formtype) {

	function paddy(n, p, c) {
		var pad_char = typeof c !== 'undefined' ? c : '0';
		var pad = new Array(1 + p).join(pad_char);
		return (pad + n).slice(-pad.length);
	}
	function utc_to_local(date) {
		var offset = -180 * 60000;
		return new Date(date - offset);
	}
	function format_ru_date(date_) {
		if (date_ == null) return null;
		var date = utc_to_local(date_);
		return paddy(date.getDate(), 2) + '.' + paddy(date.getMonth()+1, 2) + '.' + paddy(date.getFullYear(), 4);
	}
	function getCourseOrderKey(line) {
		return String(line.sport_eventid)+'-'+String(line.sportid);
	}

	function addDays(date, days) {
		var result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}

	var substringValueMatcher = function(strs) {
		return function findMatches(q, cb) {
			// an array that will be populated with substring matches
			let matches = [];

			// regex used to determine if a string contains the substring `q`
			let substrRegex = new RegExp(q, 'i');

			// iterate through the pool of strings and for any string that
			// contains the substring `q`, add it to the `matches` array
			jQuery.each(strs, function(i, str) {
				if (substrRegex.test(str.name)) {
					matches.push(str.name);
				}
			});

			cb(matches);
		};
	};

	jQuery.extend(jQuery.validator.messages, {
        required: "Это поле необходимо заполнить.",
        remote: "Пожалуйста, введите правильное значение.",
        email: "Пожалуйста, введите корретный адрес электронной почты.",
        url: "Пожалуйста, введите корректный URL.",
        date: "Пожалуйста, введите корректную дату.",
        dateISO: "Пожалуйста, введите корректную дату в формате ISO.",
        number: "Пожалуйста, введите число.",
        digits: "Пожалуйста, вводите только цифры.",
        creditcard: "Пожалуйста, введите правильный номер кредитной карты.",
        equalTo: "Пожалуйста, введите такое же значение ещё раз.",
        accept: "Пожалуйста, выберите файл с правильным расширением.",
        maxlength: jQuery.validator.format("Пожалуйста, введите не больше {0} символов."),
        minlength: jQuery.validator.format("Пожалуйста, введите не меньше {0} символов."),
        rangelength: jQuery.validator.format("Пожалуйста, введите значение длиной от {0} до {1} символов."),
        range: jQuery.validator.format("Пожалуйста, введите число от {0} до {1}."),
        max: jQuery.validator.format("Пожалуйста, введите число, меньшее или равное {0}."),
        min: jQuery.validator.format("Пожалуйста, введите число, большее или равное {0}.")
    });

    function transliterate(text) {
		var transl=new Array();
		transl['А']='A';	transl['а']='a';
		transl['Б']='B';	transl['б']='b';
		transl['В']='V';	transl['в']='v';
		transl['Г']='G';	transl['г']='g';
		transl['Д']='D';	transl['д']='d';
		transl['Е']='E';	transl['е']='e';
		transl['Ё']='E';	transl['ё']='e';
		transl['Ж']='Zh';	transl['ж']='zh';
		transl['З']='Z';	transl['з']='z';
		transl['И']='I';	transl['и']='i';
		transl['Й']='I';	transl['й']='i';
		transl['К']='K';	transl['к']='k';
		transl['Л']='L';	transl['л']='l';
		transl['М']='M';	transl['м']='m';
		transl['Н']='N';	transl['н']='n';
		transl['О']='O';	transl['о']='o';
		transl['П']='P';	transl['п']='p';
		transl['Р']='R';	transl['р']='r';
		transl['С']='S';	transl['с']='s';
		transl['Т']='T';	transl['т']='t';
		transl['У']='U';	transl['у']='u';
		transl['Ф']='F';	transl['ф']='f';
		transl['Х']='Kh';	transl['х']='kh';
		transl['Ц']='Ts';	transl['ц']='ts';
		transl['Ч']='Ch';	transl['ч']='ch';
		transl['Ш']='Sh';	transl['ш']='sh';
		transl['Щ']='Shch';	transl['щ']='shch';
		transl['Ъ']='"';	transl['ъ']='"';
		transl['Ы']='Y';	transl['ы']='y';
		transl['Ь']='\'';	transl['ь']='\'';
		transl['Э']='E';	transl['э']='e';
		transl['Ю']='Iu';	transl['ю']='iu';
		transl['Я']='Ia';	transl['я']='ia';
		
		var result = '';
		for(var i=0; i<text.length; i++) {
			if(transl[text[i]] != undefined) { result += transl[text[i]]; }
			else { result += text[i]; }
		}
		return result;
	};


	function loadCaptcha() {
		var htmlid = 'google-recaptcha-script';
		// var el = document.getElementById(htmlid);
		// if (el) document.head.removeChild(el);
		const gRecaptcha = document.createElement("script");
		gRecaptcha.src = "https://www.google.com/recaptcha/api.js?hl=ru";
		gRecaptcha.async = true;
		gRecaptcha.defer = true;
		gRecaptcha.id = htmlid;
		document.head.appendChild(gRecaptcha);
	};

	var Fields = {
		FieldLine: React.createClass({
			render: function() {
				var label = this.props.label,
					tip = this.props.tip || '',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = '',
					inputDivClass = '',
					inputClass = 'form-control',
					requiredClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'col-sm-9';
				}
				if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputClass += ' required';
				}

				return (
					<div className="form-group">
						<label className={labelClass}>{label}</label>
						<div className={inputDivClass}>
							{this.props.children}
						</div>
						<div className={inputDivClass}>
							<span className="help-block">{tip}</span>
						</div>
					</div>
				);
			}
		}),
		
		Fullname: React.createClass({
			getInitialState: function(props) {
				return {
					last_name_latin: '',
					first_name_latin: ''
				};
			},

			onChangeLastName: function(e) {
				this.setState({
					last_name_latin: transliterate(e.target.value)
				})
			},
			onChangeFirstName: function(e) {
				this.setState({
					first_name_latin: transliterate(e.target.value)
				})
			},
			onChangeLastNameLatin: function(e) {
				this.setState({
					last_name_latin: e.target.value
				})
			},
			onChangeFirstNameLatin: function(e) {
				this.setState({
					first_name_latin: e.target.value
				})
			},

			render: function () {
				var required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = '',
					inputDivClass = 'form-control',
					requiredClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'form-control';
				}
				var requiredInputDivClass = inputDivClass;
				if (required) {
					labelClass += ' required';
					requiredClass = 'required';
					requiredInputDivClass += ' required';
				}
				var latin_fields = '';
				if (this.props.include_latin) {
					latin_fields = (
						<div className="form-group">
							<label className={labelClass} htmlFor="_lastName_profile_id">ФИО на английском:</label>
							<div className="col-sm-3">
								<input name="last_name_latin" placeholder="Ivanov" className={requiredInputDivClass} required={requiredClass} type="text" value={this.state.last_name_latin} onChange={this.onChangeLastNameLatin} />
							</div>
							<div className="col-sm-3">
								<input name="first_name_latin" placeholder="Sergey" className={requiredInputDivClass} required={requiredClass} type="text" value={this.state.first_name_latin} onChange={this.onChangeFirstNameLatin} />
							</div>
						</div>
						);
				}
				return (
					<div>
						<div className="form-group">
							<label className={labelClass} htmlFor="_lastName_profile_id">ФИО:</label>
							<div className="col-sm-3">
								<input name="last_name" placeholder="Иванов" className={requiredInputDivClass} required={requiredClass} type="text" onChange={this.onChangeLastName} />
							</div>
							<div className="col-sm-3">
								<input name="first_name" placeholder="Сергей" className={requiredInputDivClass} required={requiredClass} type="text" onChange={this.onChangeFirstName} />
							</div>
							<div className="col-sm-3">
								<input name="middle_name" placeholder="Петрович" className={inputDivClass} type="text" />
							</div>
						</div>
						{latin_fields}
					</div>
				);
			}
		}),

		Gender: React.createClass({
			render: function () {
				var name = this.props.name || 'gender',
					id = this.props.id || name,
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = '',
					inputDivClass = '',
					inputClass = '',
					requiredClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'col-sm-2 col-lg-1';
				}
				if (required) {
					requiredClass = 'required';
					labelClass += ' required';
					inputClass += ' required';
				}
				var man_htmlid = '_man_'+id+'_id',
					lady_htmlid = '_lady_'+id+'_id';

				return (
					<div className="form-group">
						<label className={labelClass}>Пол:</label>
						<div className={inputDivClass}>
							<label className="radio-inline"><input type="radio" name={name} value="man" id={man_htmlid} required={required} /> Мужчина</label>
						</div>
						<div className={inputDivClass}>
							<label className="radio-inline"><input type="radio" name={name} value="lady" id={lady_htmlid} required={required}/> Женщина</label>
						</div>
					</div>
				);
			}
		}),

		Birthdate: React.createClass({
			componentDidMount: function () {
				// jQuery(this.getDOMNode()).find('input').datepicker();
			},
			render: function () {
				var name = this.props.name || 'birthdate',
					id = this.props.id || name,
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = '',
					inputDivClass = '',
					inputClass = 'form-control datepicker',
					requiredClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'col-sm-9';
				}
				if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputClass += ' required';
				}
				var input_htmlid = '_'+id+'_id';
				var years = [],
					months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
					days = [],
					year_name = name + '_year', year_id = year_name + '_id',
					month_name = name + '_month', month_id = month_name + '_id',
					day_name = name + '_day', day_id = day_name+ '_id';
				let top_year = new Date().getYear() + 1900 - 8;
				for (var i=top_year; i>1930; i--) years.push(i);
				for (var i=1; i<=31; i++) days.push(i);

				return (
					<div className="form-group">
						<label className={labelClass}>Дата рождения:</label>
						<div className={inputDivClass}>
							<select name={year_name} id={year_id} required={required} data-type="int">
								<option></option>
							{years.map(function (opt) {
								return <option value={opt} key={opt}>{opt}</option>;
							})}
							</select>
							&nbsp;
							<select name={month_name} id={month_id} required={required} data-type="int">
								<option></option>
							{months.map(function (opt, i) {
								return <option value={i} key={opt}>{opt}</option>;
							})}
							</select>
							&nbsp;
							<select name={day_name} id={day_id} required={required} data-type="int">
								<option></option>
							{days.map(function (opt) {
								return <option value={opt} key={opt}>{opt}</option>;
							})}
							</select>
						</div>
					</div>
				)
			}
		}),

		Address: React.createClass({
			componentDidMount: function () {
				var me = this;
				var name = this.props.name || '',
					name_region = name + 'region', id_region = name_region + '_id',
					name_city = name + 'city', id_city = name_city + '_id';
				requestRegions(function (data) {
					jQuery(me.refs.region_input).typeahead({
						hint: true,
						highlight: true,
						minLength: 1
					},
					{
						name: 'regions',
						source: substringValueMatcher(data)
					});
				});
				requestCities(function (data) {
					jQuery(me.refs.city_input).typeahead({
						hint: true,
						highlight: true,
						minLength: 1
					},
					{
						name: 'cities',
						source: substringValueMatcher(data)
					});
				});
				
			},
			render: function () {
				var name = this.props.name || '',
					id = this.props.id || name,
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = '',
					inputDivClass = '',
					inputClass = 'form-control',
					requiredClass = '',
					widthClass = '', shortWidthClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'col-sm-3';
					widthClass = 'col-sm-4';
					shortWidthClass = 'col-sm-1';
				}
				var requiredLabelClass = labelClass, 
					requiredInputClass = inputClass,
					requiredFormControlClass = 'form-control';
				if (required) {
					requiredClass = 'required';
					requiredLabelClass = labelClass + ' required';
					requiredInputClass = inputClass + ' required';
					requiredFormControlClass = requiredFormControlClass + ' required';
				}
				var input_htmlid = '_'+id+'_id',
					block_htmlid = id + 'address';
				var label_postal_index = 'Индекс',
					label_region = 'Регион',
					label_district = 'Район',
					label_city = 'Город',
					label_address = 'Адрес',
					label_street = 'Улица',
					label_house = 'Дом',
					label_housing = 'Строение',
					label_apartment = 'Квартира';
				var name_postal_index = name + 'postal_index', id_postal_index = name_postal_index + '_id',
					name_region = name + 'region', id_region = name_region + '_id',
					name_district = name + 'district', id_district = name_district + '_id',
					name_city = name + 'city', id_city = name_city + '_id',
					name_street = name + 'street', id_street = name_street + '_id',
					name_house = name + 'house', id_house = name_house + '_id',
					name_housing = name + 'housing', id_housing = name_housing + '_id',
					name_apartment = name + 'apartment', id_apartment = name_apartment + '_id';

				return (
				<div id={block_htmlid}>
					{/*<div className="form-group">
						<label className={requiredLabelClass} htmlFor={id_postal_index}>{label_postal_index}:</label>
						<div className={widthClass}>
							<input name={name_postal_index} className={requiredFormControlClass} id={id_postal_index} />
						</div>
					</div>*/}
					<div className="form-group">
						<label className={requiredLabelClass} htmlFor={id_region}>{label_region}:</label>
						<div className={widthClass}>
							<input name={name_region} className={requiredFormControlClass} id={id_region} ref="region_input" />
						</div>
					</div>
					<div className="form-group">
						<label className={requiredLabelClass} htmlFor={id_city}>{label_city}:</label>
						<div className={widthClass}>
							<input name={name_city} className={requiredFormControlClass} id={id_city} ref="city_input" />
						</div>
					</div>
					{/*<div className="form-group">
						<label className={requiredLabelClass} htmlFor={id_street}>{label_address}:</label>
						<div className={widthClass}>
							<input name={name_street} className={requiredFormControlClass} placeholder={label_street} id={id_street} />
						</div>
						<div className={shortWidthClass}>
							<input name={name_house} className="form-control " placeholder={label_house} id={id_house} />
						</div>
						<div className={shortWidthClass}>
							<input name={name_housing} className="form-control " placeholder={label_housing} id={id_housing} />
						</div>
						<div className={shortWidthClass}>
							<input name={name_apartment} className="form-control " placeholder={label_apartment} id={id_apartment} />
						</div>
					</div>*/}
				</div>
				);
			}
		}),

		Phone: React.createClass({
			render: function () {
				var name = this.props.name || 'phone',
					id = this.props.id || name,
					label = this.props.label || 'Телефон',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = '',
					inputDivClass = '',
					inputClass = 'form-control phone',
					requiredClass = '',
					tipClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'col-sm-3';
					tipClass = 'col-sm-6';
				}
				if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputClass += ' required';
				}
				var input_htmlid = '_'+id+'_id';

				return (
					<div className="form-group">
						<label className={labelClass} htmlFor={input_htmlid}>{label}:</label>
						<div className={inputDivClass}>
							<input type="tel" placeholder="+7 (916) 123-4567" name={name} id={input_htmlid} className={inputClass} required={required} />
						</div>
						<div className={tipClass}>
							<span className="help-block">{this.props.tip}</span>
						</div>
					</div>
				);
			}
		}),

		Email: React.createClass({
			render: function () {
				var name = this.props.name || 'email',
					id = this.props.id || name,
					label = this.props.label || 'E-mail',
					tip = this.props.tip || 'Введите e-mail для получения результатов обработки заявки.',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = '',
					inputDivClass = '',
					inputClass = 'form-control email',
					requiredClass = '',
					tipClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'col-sm-3';
					tipClass = 'col-sm-6';
				}
				if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputClass += ' required';
				}
				var input_htmlid = '_'+id+'_id';

				return (
					<div className="form-group">
						<label className={labelClass} htmlFor={input_htmlid}>{label}:</label>
						<div className={inputDivClass}>
							<input type="email" placeholder="test@example.com" name={name} id={input_htmlid} className={inputClass} required={required} />
						</div>
						<div className={tipClass}>
							<span className="help-block">{tip}</span>
						</div>
					</div>
				);
			}
		}),

		Password: React.createClass({
			render: function () {
				var name = this.props.name || 'password',
					id = this.props.id || name,
					label = this.props.label || 'Пароль',
					tip = this.props.tip || 'пароль вводится с учётом регистра',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					disabled = this.props.disabled || false,
					labelClass = '',
					inputDivClass = '',
					inputClass = 'form-control password',
					requiredClass = '',
					tipClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'col-sm-3';
					tipClass = 'col-sm-6';
				}
				if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputClass += ' required';
				}
				var input_htmlid = '_'+id+'_id';

				return (
					<div className="form-group">
						<label className={labelClass} htmlFor={input_htmlid}>{label}:</label>
						<div className={inputDivClass}>
							<input type="password" name={name} id={input_htmlid} className={inputClass} required={required} disabled={disabled} />
						</div>
						<div className={tipClass}>
							<span className="help-block">{tip}</span>
						</div>
					</div>
				);
			}
		}),


		Education: React.createClass({
			render: function () {
				var name = this.props.name || 'education',
					id = this.props.id || name,
					label = this.props.label || 'Образование',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = '',
					inputDivClass = '',
					inputClass = 'form-control education',
					requiredClass = '',
					tipClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'col-sm-2';
				}
				if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputClass += ' required';
				}
				return (
					<div className="form-group">
						<label className={labelClass}>{label}:</label>
						<div className={inputDivClass}>
							<label className="radio-inline"><input type="radio" name={name} value="EDU_HIGHER" /> Высшее</label>
						</div>
						<div className={inputDivClass}>
							<label className="radio-inline"><input type="radio" name={name} value="EDU_INCOMP_HIGHER" /> Неоконченное высшее</label>
						</div>
						<div className={inputDivClass}>
							<label className="radio-inline"><input type="radio" name={name} value="EDU_VOCATIONAL" /> Средне-специальное</label>
						</div>
						<div className={inputDivClass}>
							<label className="radio-inline"><input type="radio" name={name} value="EDU_SECONDARY" /> Среднее</label>
						</div>
					</div>
				)
			}
		}),

		SelectedCourse: React.createClass({
			render: function () {
				var name = this.props.name || 'sportid',
					id = this.props.id || name,
					label = this.props.label || 'Выбранный курс',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = 'col-sm-3 col-md-2',
					inputDivClass = 'course-name',
					inputClass = 'form-control sport',
					requiredClass = '',
					course = this.props.course,
					sportname = '';
				var hash_token = window.location.hash.split('-'),
					courseid = hash_token[0].substr(1),
					sportid = hash_token[1];
				if (course.sports) {
					course.sports.map(function (sport, i) {
						if (sport.id == sportid) sportname = sport.name;
					});
				}
				return (
					<div className="form-group">
						<label className={labelClass}>{label}:</label>
						<div className={inputDivClass}>
							<b>
								{format_ru_date(course.sport_eventstart_date)} - {format_ru_date(course.sport_eventfinish_date)},&nbsp;
								{course.sport_eventname},&nbsp;
								{course.locationname},&nbsp;
								{sportname}
							</b>
						</div>
					</div>
				);
			}
		}),

		CurrentPerson: React.createClass({
			render: function () {
				var person = this.props.person,
					label = this.props.label || 'Анкета',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = 'col-sm-3 col-md-2',
					inputDivClass = '',
					inputClass = 'form-control sport',
					requiredClass = '';
				var hash_token = window.location.hash.split('-'),
					courseid = hash_token[0].substr(1),
					sportid = hash_token[1];
				return (
					<div className="form-group">
						<label className={labelClass}>{label}:</label>
						<div className={inputDivClass}>
							<b>
								{person.fullname}
								<input type="hidden" name="personid" value={person.id} />
							</b>
						</div>
					</div>
				);
			}
		}),

		Sport: React.createClass({
			render: function () {
				var name = this.props.name || 'sportid',
					id = this.props.id || name,
					label = this.props.label || 'Спортивная дисциплина',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = 'col-sm-3 col-md-2',
					inputDivClass = '',
					inputClass = 'form-control sport',
					requiredClass = '',
					tipClass = '',
					sports = this.props.sports || [];
				if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputClass += ' required';
				}
				return (
					<div className="form-group">
						<label className={labelClass}>{label}</label>
						<div className="col-sm-9">
							<select name={name} required={required} data-type="int">
							{sports.map(function (opt) {
								return (
									<option value={opt.id} key={opt.id}>{opt.name}</option>
								);
							})}
							</select>
						</div>
					</div>
				);
			}
		}),

		Language: React.createClass({
			render: function () {
				return (
					<div className="form-group">
						<label className="col-sm-3 col-md-2">Иностранный язык</label>
						<div className="col-sm-9">
							{this.props.options.map(function (opt) {
								return (
									<div key={opt.code}>
										<label className="checkbox-inline">
											<input type="checkbox" name="languages" data-array="true" value={opt.code} />{opt.name}
										</label>
									</div>
								);
							})}
						</div>
					</div>
				)
			}
		}),

		MarketingSource: React.createClass({
			render: function () {
				var opts = this.props.options || [];
				return (
					<div className="form-group">
						<label className="col-sm-3 col-md-2">Как вы узнали о курсах?</label>
						<div className="col-sm-9">
							{opts.map(function (opt) {
								return (
									<div key={opt.id}>
										<label className="checkbox-inline">
											<input type="checkbox" name="marketing_sources" data-type="int" data-array="true" value={opt.id} />{opt.name}
										</label>
									</div>
								);
							})}
							<div>
								<label className="checkbox-inline">
									<input className="form-control" type="checkbox" name="recommend_sources_other_checkbox" />Другое
								</label>
							</div>
							<input type="text" name="marketing_source_other" className="col-sm-9" />
						</div>
					</div>
				);
			}
		}),

		RecommendedBy: React.createClass({
			
			render: function () {
				var opts = this.props.options || [];
				opts.sort(function(a, b) {
                    return a.name > b.name ? 1 : -1;
                });
				return (
					<div className="form-group">
						<label className="col-sm-3 col-md-2">Курс рекомендован преподавателем НЛИ:</label>
						<div className="col-sm-9">
							<select name="recommended_byid" data-type="int">
								<option value="0">Без рекоммендации</option>
								{opts.map(function (opt) {
									return <option value={opt.id} key={opt.id}>{opt.name}</option>
								})}
							</select>
						</div>
					</div>
				);
			}
		}),

		PersonalGoals: React.createClass({
			render: function () {
				var opts = this.props.options || [];
				return (
					<div className="form-group">
						<label className="col-sm-3 col-md-2">Для чего вы идёте на данный курс?</label>
						{opts.map(function (opt) {
							return (
							<div key={opt.id} className="col-sm-3 col-md-2">
								<label className="checkbox-inline">
									<input type="checkbox" name="personal_goals" data-type="int" data-array="true" value={opt.id} />{opt.name}
								</label>
							</div>
							);
						})}
						<div className="col-sm-3">
							<div>
								<label className="checkbox-inline">
									<input className="form-control" type="checkbox" name="personal_goals_other_checkbox" />Свой вариант
								</label>
							</div>
							<input className="col-sm-9" type="text" name="personal_goals_other" />
						</div>
					</div>
				);
			}
		}),

		Text: React.createClass({
			render: function () {
				var name = this.props.name || 'comment',
					id = this.props.id || name,
					label = this.props.label || 'Комментарии',
					tip = this.props.tip || '',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = '',
					inputDivClass = '',
					inputClass = 'form-control',
					requiredClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'col-sm-9';
				}
				if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputClass += ' required';
				}
				var input_htmlid = '_'+id+'_id';

				return (
					<div className="form-group">
						<label className={labelClass}>Комментарии:</label>
						<div className={inputDivClass}>
							<textarea name={name} id={input_htmlid} className={inputClass} required={requiredClass}></textarea>
						</div>
						<div className={inputDivClass}>
							<span className="help-block">{tip}</span>
						</div>
					</div>
				)
			}
		}),

		Checkbox: React.createClass({
			getInitialState: function(props) {
				return {
					isChecked: (typeof this.props.checked == 'undefined' ? false : this.props.checked),
					callback: this.props.callback
				};
			},

			onChange: function() {
				this.setState({isChecked: !this.state.isChecked});
				if (typeof this.state.callback != 'undefined') this.state.callback(!this.state.isChecked);
			},

			render: function() {
				var name = this.props.name || 'agreed',
					id = this.props.id || name,
					label = this.props.label || 'Я соглашаюсь с условиями пользования услуг.',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					labelClass = 'checkbox-inline',
					inputDivClass = '',
					inputClass = 'form-control',
					requiredClass = '';
				if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputClass += ' required';
				}
				var input_htmlid = '_'+id+'_id';
				return (
					<div className="form-group col-sm-12">
						<div>
							<label className={labelClass}>
								<input type="checkbox" name={name} id={id} required={requiredClass} checked={this.state.isChecked} onChange={this.onChange} />
								<span dangerouslySetInnerHTML={{__html: label}} />
								<br/>
							</label>
						</div>
					</div>
				);
			}
		}),

		SameCheckbox: React.createClass({
			getInitialState: function() {
				return {
					isSame: undefined
				}
			},

			onChange: function(e) {
				this.setState({
					isSame: e.currentTarget.value
				});
			},

			componentDidMount: function () {
				// this.onChange(typeof this.props.checked == 'undefined' ? true : this.props.checked);
			},

			render: function() {
				var name = this.props.name || 'same_as',
					id = this.props.id || name,
					label1 = this.props.label1 || 'Такой же как выше',
					label2 = this.props.label2 || 'Другой',
					tip = this.props.tip || '',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || true,
					requiredClass = (required ? "required" : "");
				return (
					<div>
						<div className="form-group">
							<div className="col-sm-12">
								<label className="radio-inline"><input type="radio" name={name} value="true" required={requiredClass} checked={this.state.isSame == "true"} onClick={this.onChange} ref="input1" /> {label1}</label><br/>
								<label className="radio-inline"><input type="radio" name={name} value="false" required={requiredClass} checked={this.state.isSame == "false"} onClick={this.onChange} ref="input2" /> {label2}</label><br/>
							</div>
							<div className="col-sm-12">
								<span className="help-block">{tip}</span>
							</div>
						</div>
						{this.state.isSame == "false" && this.props.children}
					</div>
				);
			}

			// render: function () {
			// 	var name = this.props.name || 'same_as',
			// 		id = this.props.id || name,
			// 		label = this.props.label || 'То же самое',
			// 		required = this.props.required || false,
			// 		horizontalForm = this.props.horizontalForm || true,
			// 		checked = typeof this.props.checked == 'undefined' ? true : this.props.checked;

			// 	return (
			// 		<Fields.Checkbox name={name} id={id} label={label} required={required} horizontalForm={horizontalForm} checked={checked} callback={this.onChange} />
			// 	)
			// }
		}),

		CourseSelector: React.createClass({
			componentDidMount: function() {
				var name = this.props.name || 'selector',
					id = this.props.id || name,
					label = this.props.label || 'Выберите вариант',
					input_htmlid = '_'+id+'_id';
				jQuery('#' + input_htmlid).select2({
					placeholder: label
				});
			},
			render: function () {
				var name = this.props.name || 'selector',
					id = this.props.id || name,
					label = this.props.label || 'Выберите вариант',
					tip = this.props.tip || '',
					required = this.props.required || false,
					horizontalForm = this.props.horizontalForm || false,
					labelClass = '',
					inputDivClass = '',
					inputClass = 'form-control',
					requiredClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass = 'col-sm-9';
				}
				if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputClass += ' required';
				}
				var input_htmlid = '_'+id+'_id';
				return (
					<div className="form-group">
						<label className={labelClass}>{label}:</label>
						<div className={inputDivClass}>
							<select name={name} id={input_htmlid} className={inputClass} required={requiredClass} data-type="int">
								<option></option>
							{this.props.options.map(function(group) {
								return (
									<optgroup label={group.name} key={group.id}>
										{group.events.map(function(course) {
											var start_date = format_ru_date(course.sport_eventstart_date),
												finish_date = format_ru_date(course.sport_eventfinish_date);
											return (
												<option value={course.id} key={course.id}>
													{start_date}-{finish_date} - {course.locationname}, {course.sport_eventname}
												</option>
											);
										})}
									</optgroup>
								);
							})}
							</select>
						</div>
						<div className={inputDivClass}>
							<span className="help-block">{tip}</span>
						</div>
					</div>
				);
			}
		}),

		SelectorOther: React.createClass({
			toggleTextbox: function () {
				var $chck = jQuery(this.refs.checkbox),
					$input = jQuery(this.refs.input);
				if ($chck.is(':checked')) $input.removeAttr("disabled");
				else $input.attr("disabled", "disabled");
			},
			render: function () {
				var name = this.props.name || 'selector_other',
					id = this.props.id || name,
					label = this.props.label || 'Другой вариант',
					tip = this.props.tip || '',
					cbname = name + '_chb',
					cbid = cbname + '_id',
					horizontalForm = this.props.horizontalForm || false,
					labelClass = '',
					inputDivClass = '',
					inputClass = 'form-control disabled',
					requiredClass = '';
				if (horizontalForm) {
					labelClass = 'col-sm-3 col-md-2';
					inputDivClass += 'col-sm-9';
				}
				var input_htmlid = '_'+id+'_id';
				return (
					<div className="form-group">
						<label className={labelClass}><input type="checkbox" name={cbname} id={cbid} onClick={this.toggleTextbox} ref="checkbox" /> {label}:</label>
						<div className={inputDivClass}>
							<input type="text" name={name} id={input_htmlid} className={inputClass} disabled="disabled" ref="input" />
						</div>
						<div className={inputDivClass}>
							<span className="help-block">{tip}</span>
						</div>
					</div>
				);
			}
		})
	};


	var FGBUField = React.createClass({
		toggleGG: function (e) {
			jQuery('#gg42').toggle('slow');
			e.preventDefault();
		},

		showUdovNII: function (e) {
			window.open('https://www.isiarussia.ru/news2014/i/udovnii.jpg','Образец','width=465,height=330,resizable=no,scrollbars=np,status=no');
			e.preventDefault();
		},

		render: function () {
			if (this.props.course.with_vniifk != "true") return <div id="fgbu2"></div>;
			var required = this.props.required || false,
				labelClass = 'col-sm-1',
				inputDivClass = 'col-sm-9';
			if (required) {
					requiredClass = 'required'
					labelClass += ' required';
					inputDivClass += ' required';
				}
			return (
				<div id="fgbu2">
					<hr />
					<p style={{color: "red", fontWeight: "bold"}}>(*) Дополнительно к удостоверению НЛИ вы можете оформить <span className="jslink" onClick={this.toggleGG}>удостоверение ФГБУ ФНЦ ВНИИФК</span></p>
					<div className="well" id="gg42" style={{display: "none"}}>
						<p>Для обеспечения высокого качества подготовки инструкторов по горнолыжному спорту и сноуборду с 2013 года официальным партнером НЛИ в проведении программ подготовки инструкторов по горным лыжам и сноуборду выступает ФГБУ «Федеральный научный центр физической культуры и спорта» Министерства спорта (ФНЦ ВНИИФК). </p>
						<p>ФНЦ ВНИИФК Министерства спорта является ведущим в России научно-исследовательским институтом в области физической культуры и спорта, а также научно-методического обеспечения подготовки спортсменов по зимним и летним олимпийским видам спорта.</p>
						<p>Сотрудничество НЛИ с ФНЦ ВНИИФК направлено на совершенствование программ подготовки инструкторов, привлечение научных сотрудников к разработке теоретических курсов и подготовке методических пособий.</p>
						<p>Кроме этого, выпускникам наших Курсов подготовки инструкторов даётся право дополнительно получить удостоверение о повышении квалификации.</p>
						<p>Преимущества удостоверения о повышении квалификации:</p>
						<ul>
							<li>наличие у специалиста удостоверения свидетельствует о его серьёзной подготовке и значительно повышает его шансы быть принятым на работу в России при соискании вакансии «Инструктор по горнолыжному спорту/сноуборду»;</li>
							<li>инструктор, имеющий удостоверение НЛИ и документ ФГБУ ФНЦ ВНИИФК, имеет конкурентное преимущество при трудоустройстве на работу по сравнению с другими соискателями;</li>
							<li>данный документ имеет основание учитываться администрацией спортивной школы/клуба как пройденный курс повышения квалификации, что особенно важно для работников государственных, муниципальных, бюджетных учреждений дополнительного образования и других учебных учреждений, для которых прохождение курсов повышения квалификации каждые 5 лет является обязательным требованием профессиональной деятельности.</li>
						</ul>
						<p>В случае если вы планируете работать за рубежом, то оформление документа ФНЦ ВНИИФК Министерства спорта будет иметь преимущество, но не является обязательным.</p>
						<p>Удостоверение НЛИ получают все участники курса, которые успешно прошли все тесты, а Удостоверение  ФГБУ ФНЦ ВНИИФК выдается и ОПЛАЧИВАЕТСЯ ДОПОЛНИТЕЛЬНО по желанию участника.</p>
					</div>
					- <span className="jslink" onClick={this.showUdovNII}>удостоверение</span> о повышении квалификации по пройденной программе.
					<p>Слушатели Курсов, оформившие удостоверение ФГБУ ФНЦ ВНИИФК получат дополнительный лекционный материал по темам: «Возрастная педагогика. Основные принципы, методы обучения и формы организации занятий с детьми»,  «Особенности питания и восстановления при физических нагрузках», примут участие в вебинаре с ведущими профессорами  ФГБУ ФНЦ ВНИИФК,  на котором смогут задать интересующие вопросы и получить квалифицированные ответы по этим темам.</p>
					<p>Дополнительно для получения удостоверения ФГБУ ФНЦ ВНИИФК нужно доплатить:</p>
					<ul>
						<li>для слушателей категории «С» - 2 700 рублей;</li>
						<li>для слушателей категории «В» - 3 750 рублей;</li>
						<li>для слушателей категории «А» - 6 150 рублей.</li>
					</ul>
					<br/>
					<div className="form-group">
						<div className={inputDivClass}>
							<label className="radio-inline"><input type="radio" name="with_vniifk" value="true" required={requiredClass} /> С удостоверением ФГБУ ФНЦ ВНИИФК</label><br/>
							<label className="radio-inline"><input type="radio" name="with_vniifk" value="false" required={requiredClass} /> Без удостоверения ФГБУ ФНЦ ВНИИФК</label>
						</div>
					</div>
					<br/>
					<p>Для получения удостоверения  ФГБУ ФНЦ ВНИИФК необходимо пройти регистрацию в реестрах института. В связи с этим, помимо других документов нужно отправить документ об образовании.</p>
					<hr/>
					<p>В связи с тем, что участникам курсов, успешно сдавшим тесты, для получения удостоверений необходимо пройти регистрацию в реестрах НП ПИ НЛИ и ФГБУ ФНЦ ВНИИФК, удостоверения и сертификаты инструкторов высылаются в течение шести недель после окончания курса почтой. Во избежание проблем с пересылкой просим Вас внимательно заполнить все поля заявки. Обязательно укажите свой почтовый адрес.</p>
				</div>
			);
		}
	});

	var MastershipYears = React.createClass({
		toggleTextbox: function() {
			var $chck = jQuery(this.getDOMNode()).find('input[type="checkbox"]'),
				$input = jQuery(this.getDOMNode()).find('input[type="text"]');
			if ($chck.is(':checked')) $input.attr("disabled", "disabled");
			else $input.removeAttr("disabled");
		},

		render: function() {
			var name = this.props.name || 'alpski_years',
				id = this.props.id || name,
				label = this.props.label || 'На горных лыжах',
				required = this.props.required || false,
				horizontalForm = this.props.horizontalForm || true;
			var input_htmlid = '_'+id+'_id',
				chck_name = name + '_missing',
				chck_htmlid = '_'+chck_name+'_id';

			return (
				<div className="col-sm-9">
					<label className="col-sm-3" htmlFor={input_htmlid}>{label}: </label>
					<div className="col-sm-2"><input type="text" name={name} id={input_htmlid} style={{width: "60px"}} data-type="int" /></div>
					<label className="checkbox-inline col-sm-3">
						<input type="checkbox" name={chck_name} id={chck_htmlid} onClick={this.toggleTextbox} /> не катаюсь
					</label>
				</div>
			);
		}
	});
	
	var MastershipYearsAssembled = React.createClass({
		render: function () {
			var name = this.props.name || 'comment',
				id = this.props.id || name,
				label = this.props.label || 'Комментарии',
				tip = this.props.tip || '',
				required = this.props.required || false,
				horizontalForm = this.props.horizontalForm || true,
				labelClass = '',
				inputDivClass = '',
				inputClass = 'form-control',
				requiredClass = '';
			if (horizontalForm) {
				labelClass = 'col-sm-3 col-md-2';
				inputDivClass = 'col-sm-9';
			}
			if (required) {
				requiredClass = 'required'
				labelClass += ' required';
				inputClass += ' required';
			}
			var input_htmlid = '_'+id+'_id';

			return (
				<div className="form-group">
					<label className={labelClass}>Сколько лет катаетесь:</label>
					<div className={inputDivClass}>
						<MastershipYears name="alpski_years" label="На горных лыжах" />
						<MastershipYears name="snowboard_years" label="На сноуборде" />
					</div>
					<div className={inputDivClass}>
						<span className="help-block">{tip}</span>
					</div>
				</div>
			)
		}
	});

	var Signup = React.createClass({
		togglePasswords: function(e) {
			var disabled = jQuery('#signup-password input').prop("disabled");
			jQuery('#signup-password input').prop("disabled", !disabled);
			jQuery('#signup-password').toggle();
		},

		render: function() {
			return (
				<div>
					{/*
					<div className="form-group col-sm-12">
						<div>
							<label className="checkbox-inline">
								<input type="checkbox" name="signup" id="_id_signup" onClick={this.togglePasswords} />
								Я хочу зарегистрироваться и получить доступ к управлению своими личнымы данными.
							</label>
						</div>
					</div>
					*/}
					<br/>
					<div id="signup-password">
						<div className="form-group col-sm-12">
							<div><p className="bg-info">Регистрация в личном кабинете</p></div>
						</div>
						<p style={{padding: '0 15px', color: "red"}}>Внимание! Адрес Вашей электронной почты автоматически становиться Вашим логином в личном кабинете.</p>
						<Fields.Password required={true} label="Придумайте пароль" tip="Пароль для входа в личный кабинет должен содержать не менее 4 символов" />
						<Fields.Password required={true} name="password2" label="Подтвердите пароль" tip="пароли должны совпадать" />
					</div>
				</div>
			);
		}
	});

	var Signin = React.createClass({
		showError: function(error) {
			var $form = jQuery('#auth-form');
			$form.find('input,button').removeAttr('disabled');
			$form.find('.error').html(error.ExceptionText);
		},
		submit: function(e) {
			var me = this;
			e.preventDefault();
			var $form = jQuery('#auth-form'),
				$email = $form.find('[name="email"]'),
				$password = $form.find('[name="password"]');
			$form.find('input,button').attr('disabled', 'disabled');
			effi = new EffiProtocol({host: baseurl, login: $email.val(), password: $password.val()});
			effi.auth({
				success: function() {
					requestPerson(function(person) {
						me.props.onSignin(person);
					}, me.showError);
				}, 
				error: me.showError
			});
		},
		clickSignup: function(e) {
			e.preventDefault();
			this.props.chooseOrderWithSignup();
		},
		clickNoSignup: function(e) {
			e.preventDefault();
			this.props.chooseOrderNoSignup();
		},
		render: function() {
			return (
			<div>
				<div className="col-sm-7">
					<div id="isia-order-signin-container">
						<p>Я уже регистрировался ранее и хочу подать заявку от своего имени повторно.</p>
						<form id="auth-form" className="validated-form form-horizontal " role="form" method="post" onSubmit={this.submit}>
							<p className="error"></p>
							<Fields.Email required={true} tip="&nbsp;" />
							<Fields.Password required={true} />
							<button className="btn btn-primary btn-lg button-submit-signin">Войти и приступить к оформлению</button>
							<a href="/public/restore-password.html">Забыли пароль?</a>
						</form>
					</div>
				</div>
				<div className="col-sm-5 orderform-enter-no-signin">
					<p>Оформить заявку без регистрации</p>
					<button className="btn btn-primary btn-lg button-skip-signin" onClick={this.clickNoSignup}>Оформить заявку</button>
				</div>
				<div className="col-sm-5 orderform-enter-with-signin">
					<p>Я не регистрировался ранее и хотел бы приступить к оформлению заявки.</p>
					<button className="btn btn-primary btn-lg button-skip-signin" onClick={this.clickSignup}>Оформить заявку</button>
				</div>
			</div>
			);
		}
	});

	var RetakeTime = React.createClass({
		render: function() {
			var name = this.props.name || 'retake_time',
				id = this.props.id || name,
				label = this.props.label || 'Который раз пересдается тест?',
				tip = this.props.tip || '',
				required = this.props.required || false,
				horizontalForm = this.props.horizontalForm || true;
			return (
				<Fields.FieldLine name={name} label={label} tip={tip} required={required} horizontalForm={horizontalForm}>
					<select name={name}>
						<option value="firstly">Первый</option>
						<option value="non-firstly">Не первый</option>
					</select>
				</Fields.FieldLine>
			);
		}
	});

	var RetakeSubject = React.createClass({
		render: function() {
			var name = this.props.name || 'retake_subjectlist',
				id = this.props.id || name,
				label = this.props.label || 'Блок пересдачи:',
				tip = this.props.tip || '',
				required = this.props.required || false,
				horizontalForm = this.props.horizontalForm || true,
				requiredClass = (required ? "required" : "");
			return (
				<Fields.FieldLine name={name} label={label} tip={tip} required={required} horizontalForm={horizontalForm}>
					<label className="radio-inline"><input type="checkbox" name={name} value="technique" data-array="true" /> Техника</label><br/>
					<label className="radio-inline"><input type="checkbox" name={name} value="method" data-array="true" /> Методика</label><br/>
					<label className="radio-inline"><input type="checkbox" name={name} value="theory" data-array="true" /> Теория</label><br/>
				</Fields.FieldLine>
			);
		}
	});

	var DrivingDays = React.createClass({
		render: function() {
			var name = this.props.name || 'driving_days',
				id = this.props.id || name,
				label = this.props.label || 'Укажите количество дополнительных дней катания:',
				tip = this.props.tip || '',
				required = this.props.required || false,
				horizontalForm = this.props.horizontalForm || true,
				requiredClass = (required ? "required" : "");
			return (
				<Fields.FieldLine name={name} label={label} tip={tip} required={required} horizontalForm={horizontalForm}>
					<select name={name} data-type="int">
						<option>0</option>
						<option>1</option>
						<option>2</option>
						<option>3</option>
						<option>4</option>
						<option>5</option>
						<option>6</option>
						<option>7</option>
						<option>8</option>
						<option>9</option>
					</select>
				</Fields.FieldLine>
			);
		}
	});

	var ModalDialog = React.createClass({
		render: function () {
			var htmlid = this.props.htmlid || 'modal',
				body_htmlid = htmlid + '-body',
				caption_htmlid = htmlid + '-caption',
				caption = this.props.caption || 'Модальный диалог',
				content = this.props.content || '...';
			return (
				<div className="modal fade" id={htmlid} tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" style={{display: 'none'}}>
			      <div className="modal-dialog" role="document">
			        <div className="modal-content">
			          <div className="modal-header">
			            <button type="button" className="close" data-dismiss="modal" aria-label="Закрыть"><span aria-hidden="true">&times;</span></button>
			            <h4 className="modal-title" id={caption_htmlid}>{caption}</h4>
			          </div>
			          <div className="modal-body" id={body_htmlid}>
			            {content}
			          </div>
			          <div className="modal-footer">
			            <button type="button" className="btn btn-default" data-dismiss="modal">Закрыть</button>
			          </div>
			        </div>
			      </div>
			    </div>
			);
		}
	});

	var FormInfo = React.createClass({
		render: function () {
			return (
			<div>
				<p style={{padding: '15px', color: "red"}}>
				Обращаем ваше внимание, что первый день любого Курса является днём приезда преподавателей НЛИ и участников из других городов. Занятий в этот день нет!<br/>
				В стоимость Курса не включены организационные расходы (авиаперелёт, проживание, питание, трансфер, виза, страховка, ски-пасс и другие).
				</p>

				<p>Группа на Курс формируется заранее. Количество постоянно присутствующих на Курсе человек не может быть менее 7. Если количество людей, записавшихся на курс, по каким-либо причинам уменьшается, то Курс может быть отменён по решению НЛИ. 
				В случае непредвиденных обстоятельств (Курсы по горнолыжному спорту, сноуборду), таких как аномальная температура, отсутствие снежного покрова и других факторов, препятствующих качественному проведению занятий на склоне, Курс также может быть отменён по решению НЛИ. 
				В случае непредвиденных обстоятельств (летние курсы по программе «Роллер спорт»), таких как аномальная температура и других факторов, препятствующих качественному проведению занятий, Курс может быть отменён по решению НЛИ. 
				Об отмене Курса НЛИ проинформирует слушателей заранее, не менее чем за неделю до планируемой даты начала Курса. 
				Все возможные риски, связанные с оплатой билетов, проживания и другие, слушатель Курса берёт на себя. </p>

				<h4>Важно: </h4>
				<p>Настоятельно рекомендуем перед прохождением Курса застраховать риск получения травмы при занятиях активными видами спорта в любой страховой компании. Официальным слушателем Курса вы станете только после его оплаты. Её можно внести любым удобным для вас способом посредством квитанции, которая будет отправлена на ваш e-mail после регистрации. </p>
			</div>
			);
		}
	});

	var FormRetakeHeader = React.createClass({
		render: function() {
			return (
			<div>
			</div>
			);
		}
	});

	var FormRevalidationHeader = React.createClass({
		render: function() {
			return (
			<div>
				<p>Профессиональному инструктору необходимо периодически подтверждать свою квалификацию, что предполагает проверку его технических умений и навыков и методических знаний. Это является обязательным для специалистов, работающих в любой сфере, — обычно от них требуется прохождение курсов повышения квалификации.</p>
				<p>Для подтверждения своего профессионализма инструктор НЛИ может выбрать участие в курсе более высокой категории, тем самым повышая свою квалификацию, или прохождение процедуры подтверждения квалификации.</p>

				<h3>Правила, регулирующие процедуру подтверждения квалификации</h3>
				
				<p>1. Процедуру подтверждения квалификации в обязательном порядке проходят те инструкторы, у которых истекает срок действия удостоверения.</p>
				<p>Удостоверение инструктора НЛИ в зависимости от категории считается действительным в следующий период:</p>
				<ul>
					<li>4 года — для инструкторов категорий «С», «В-basic» и «В»;</li>
					<li>6 лет — для инструкторов категории «А».</li>
				</ul>

				<p>Если инструктор является обладателем <a href="https://www.isiarussia.ru/isiamark">карты ISIA</a>, то его удостоверение действует бессрочно и подтверждение квалификации не требуется.</p>
				
				<p>2. Подтверждение квалификации предполагает прохождение инструктором итогового тестирования по программе курса имеющейся у него категории. Итоговое тестирование проводится согласно требованиям НЛИ, действующим на момент прохождения процедуры подтверждения квалификации инструктором, по двум блокам:</p>
				<ul>
					<li>методика преподавания;</li>
					<li>демонстрация техники.</li>
				</ul>

				<p>3. Подтверждение квалификации осуществляется на курсах НЛИ той категории, которая соответствует категории инструктора (например, подтверждение квалификации инструктора категории «В» осуществляется только в рамках курса категории «В»).</p>
				<p>4. Подтверждение квалификации может проводиться на специально организованном мероприятии НЛИ.</p>
				<p>5. Процедура подтверждения квалификации предполагает три попытки, при этом каждая попытка оплачивается отдельно. Если инструктор трижды безуспешно сдаёт итоговое тестирование, то ему необходимо пройти курс той категории, которая соответствует его квалификации, заново.</p>

				<p><b>Стоимость подтверждения квалификации — 6 500 рублей (за одну попытку).</b></p>

				<p>Для качественной подготовки к прохождению процедуры подтверждения квалификации инструктор получает лекционный материал и методическое пособие по программе курса соответствующей категории. Данные материалы предоставляются инструктору после оплаты им процедуры подтверждения квалификации (лекции отправляются в электронном виде, а методическое пособие можно получить в офисе НЛИ или по Почте РФ на адрес, указанный в заявке на подтверждение квалификации инструктора НЛИ). </p>
				<p>В целях обеспечения эффективности своей технической подготовки к прохождению процедуры подтверждения квалификации НЛИ рекомендует инструкторам воспользоваться возможностью дополнительно позаниматься с группой на том курсе, где инструктор запланировал подтвердить свою квалификацию. </p>

				<h3>Дополнительные дни катания</h3>
				<p>Для подготовки к подтверждению квалификации инструктор может оплатить дополнительные дни катания с группой по соответствующему виду спорта и категории. Однако занятия на Курсе не корректируются под него, а проходят по текущей программе, поэтому перед присоединением к группе рекомендуется заранее уточнить текущую программу у куратора или старшего преподавателя Курса.</p>

				<b>Стоимость дополнительного дня катания с группой:</b> <br />
				<table cellSpacing="0" cellPadding="0" className="table table-striped">
				    <tbody>
				        <tr>
				            <th>Курс</th>
				            <th className="center">Россия, рубли</th>
				            <th className="center">Европа, евро*</th>
				        </tr>
				        <tr>
				            <td>День катания с группой на Курсе категории &laquo;С&raquo;</td>
				            <td className="center">3 500</td>
				            <td className="center">55</td>
				        </tr>
				        <tr>
				            <td>День катания с группой на Курсе категории &laquo;B-basic&raquo;</td>
				            <td className="center">3 500</td>
				            <td className="center">55</td>
				        </tr>
				        <tr>
				            <td>День катания с группой на Курсе категории &laquo;B&raquo;</td>
				            <td className="center">4 500</td>
				            <td className="center">75</td>
				        </tr>
				        <tr>
				            <td>День катания с группой на Курсе категории &laquo;А&raquo;</td>
				            <td className="center">6 000</td>
				            <td className="center">120</td>
				        </tr>
				    </tbody>
				</table>
				<p>&nbsp;* по курсу Центрального банка РФ на день оплаты.</p>

				<h3>Заявка на прохождение процедуры подтверждения квалификации</h3>
			</div>
			);
		}
	});

	var GeneralConfirmation = React.createClass({
		render: function() {
			var exceptionHideConfirmationCourses = [2350,2341,2340,2349,
			2299,2300,2334,2189,2190,2181,
			2273,2247,2328,2244,2230,2207,2205,2188,2180,
			2292,2274,2269,2259,2258,2256,2249,2187,2179,2390,
			2386,2387,2383,2384,2385,2376,2375,2372,2372,
			2356,2183,2182,2206,2333,2354,2371,2304]
			var exceptionChangeConfirmationCourses =[2312,2309,2306,2297,2296,2293,
			2289,2285,2286,2283,2284,2280,2281,2277,2275,2264,2265,2266,2267,2232,2261,2257,
			2250,2251,2252,2253,2254,2246,2235,2236,2237,2242,2243,2234,2233,2231,2223,2216,
			2217,2218,2219,2220,2221,2222,2224,2225,2226,2209,2212,2208,2210,2211,2213,2214,2215,2196,2197,2198,
			2199,2200,2201,2202,2202,2203,2195,2192,2194,2193,2185,2184,2178,2313,2301,
			2291,2272,2337,2393,2262,2260,2248,2229,2191,2186,1903,2305,2307,2298,2294,2295,2287,2288,
			2282,2290,2278,2276,2268,2263,2378,2255,2238,2239,2240,2227,2394,2204,2377,2310,2380,2241]
			var exeptionChangeConfirmationSpecialist = [2436,2435]
			var addLowConfirmation = true;
			var confirmationLabel = 'Я соглашаюсь с условиями <a href="https://www.isiarussia.ru/wp-content/uploads/plzh.pdf" target="_blank">Положения «О порядке подготовки и подтверждения категорий инструкторов по горнолыжному спорту и сноуборду»</a>.',
				additionalConfirmation = '';
			var specialistConfirmation = false;	
			for(let i=0;i < exeptionChangeConfirmationSpecialist.length ; i++){
				if(parseInt(window.location.hash.slice(1,5),10) === exeptionChangeConfirmationSpecialist[i]){
					specialistConfirmation = true;	
				    console.log(parseInt(window.location.hash.slice(1,5),10))
				}
			}
			if (this.props.course.sport_event_groupdoc_label != undefined && this.props.course.sport_event_groupdoc_label.length > 0) {
				additionalConfirmation = <Fields.Checkbox required={true} name='agreed2' label={specialistConfirmation ? 'Я соглашаюсь с политикой конфиденциальности <a href="https://kabinet.isiarussia.ru/custom/isia/PolConf.docx" target="_blank">Политика конфиденциальности</a>.'
					:this.props.course.sport_event_groupdoc_label
				} />;
			}
			if (this.props.course.sport_event_groupdoc_label2 != undefined && this.props.course.sport_event_groupdoc_label2.length > 0) {
				confirmationLabel = this.props.course.sport_event_groupdoc_label2;
			}
	
			for(let i=0;i < exceptionHideConfirmationCourses.length ; i++){
				if(parseInt(window.location.hash.slice(1,5),10) === exceptionHideConfirmationCourses[i]){
					addLowConfirmation = false;
					
				}
			}
			for(let i=0;i < exceptionChangeConfirmationCourses.length ; i++){
				if(parseInt(window.location.hash.slice(1,5),10) === exceptionChangeConfirmationCourses[i]){
					confirmationLabel = 'Я соглашаюсь с условиями <a href="https://kabinet.isiarussia.ru/custom/isia/Scan99.pdf" target="_blank">Положения «О порядке подготовки и подтверждения категорий инструкторов по горнолыжному спорту и сноуборду»</a>.';
				     console.log(parseInt(window.location.hash.slice(1,5),10))
				}
			}
			
			
			let lowConfirmation = (formtype == 'mastership_school' || formtype == 'sport_academy'
						? null
						: <Fields.Checkbox required={true} name="agreed" label={confirmationLabel} />)
			
			return (
				<div>
					{additionalConfirmation}
					{addLowConfirmation && lowConfirmation}
				</div>
			);
		}
	});

	var GeneralPersonFieldset = React.createClass({
		render: function() {
			return (
				<div>
					{/*<Fields.Sport required={true} sports={this.state.course.sports} />*/}
					<Fields.Fullname required={true} include_latin={true} />
					<Fields.Gender required={true} />
					<Fields.Birthdate required={true} />
					{/*<FGBUField course={this.state.course} required={true} />*/}
					<fieldset>
						<legend>Адрес проживания</legend>
						<Fields.Address required={true} />  
					</fieldset>
					{/*<fieldset>
						<legend>Адрес для отправки удостоверения</legend>
						<Fields.SameCheckbox name="same_as_address" required={true} label1="Такой же как адрес проживания" label2="Другой адрес для отправки удостверения">
							<Fields.Address required={true} name='actual_' />
						</Fields.SameCheckbox>
					</fieldset>*/}
					<hr />
					<Fields.Phone name="phone1" required={true} label='Мобильный телефон' />
					{/*<Fields.Phone name="phone2" label='Рабочий телефон'/>*/}
					<Fields.Email required={true} />
					<hr />
					{/*<div>
						<Fields.Education name="edu_level" />
						<br/>
					</div>*/}
				</div>
			);
		}
	});

	var GeneralAuthFieldset = React.createClass({
		render: function() {
			return (
				<div>
					<Fields.CurrentPerson person={this.props.person} />
					{/*<FGBUField course={this.state.course} />*/}
					<hr />
					<div>
						<Fields.Education name="edu_level" />
						<br/>
					</div>
				</div>
			);
		}
	});

	var GeneralFieldset = React.createClass({
		render: function() {
			var person_fields = (this.props.authorised ? 
									<GeneralAuthFieldset person={this.props.person} /> : 
									<GeneralPersonFieldset />);
			return (
				<div>
					<Fields.SelectedCourse course={this.props.course} />
					{person_fields}
					<Fields.MarketingSource options={this.props.marketing_sources} />
					<hr/>
					<Fields.RecommendedBy options={this.props.instructors} />
					<Fields.PersonalGoals options={this.props.personal_goals} />
					<Fields.Text />
					{this.props.signup}
					{/*<Captcha name="captcha" required={true} />*/}
					<GeneralConfirmation course={this.props.course} />
				</div>
			);
		}
	});

	var MastershipPersonFieldset = React.createClass({
		render: function() {
			return (
				<div>
					<Fields.Fullname required={true} include_latin={false} />
					<Fields.Gender required={true} />
					<Fields.Birthdate required={true} />
					<hr />
					<Fields.Phone name="phone1" required={true} label='Мобильный телефон' />
					{/*<Fields.Phone name="phone2" label='Рабочий телефон'/>*/}
					<Fields.Email required={true} />
					<hr />
					{/*<MastershipYearsAssembled />*/}
				</div>
			);
		}
	});

	var MastershipAuthFieldset = React.createClass({
		render: function() {
			return (
				<div>
					<Fields.CurrentPerson person={this.props.person} />
					{/*<FGBUField course={this.state.course} />*/}
					<hr />
				</div>
			);
		}
	});

	var MastershipFieldset = React.createClass({
		render: function() {
			var person_fields = (this.props.authorised ? 
									<MastershipAuthFieldset person={this.props.person} /> : 
									<MastershipPersonFieldset />);
			return (
				<div>
					<Fields.SelectedCourse course={this.props.course} />
					{person_fields}
					<Fields.MarketingSource options={this.props.marketing_sources} />
					<hr/>
					<Fields.RecommendedBy options={this.props.instructors} />
					<Fields.PersonalGoals options={this.props.personal_goals} />
					<Fields.Text />
					{this.props.signup}
					<Captcha name="captcha" required={true} />
					<GeneralConfirmation course={this.props.course} />
				</div>
			);
		}
	});

	var SportAcademyFieldset = React.createClass({
		render: function() {
			return (
				<div>
					<Fields.SelectedCourse course={this.props.course} />
					<Fields.Fullname required={true} include_latin={false} />
					<Fields.Birthdate required={true} />
					<Fields.Email required={true} />
					<Fields.Phone name="phone1" required={true} label='Мобильный телефон' />
					<Fields.Text />
					<Captcha name="captcha" required={true} />
					<GeneralConfirmation course={this.props.course} />
				</div>
			);
		}
	});

	var OrderFieldset = React.createClass({
		getInitialState: function () {
			return {
				languages: [{code: 'ru', name: 'Русский'}, {code: 'en', name: 'Английский'}, {code: 'de', name: 'Немецекий'}, {code: 'lt', name: 'Литовский'}],
				regions: [],
				cities: [],
				marketing_sources: [],
				instructors: [],
				personal_goals: [],
				course: {}
			};
		},

		componentDidMount: function () {
			var me = this;
			// requestLanguages(function (data) {
			// 	me.setState({languages: data});
			// });
			requestIsiaInstructors(function (data) {
				me.setState({instructors: data});
			});
			requestIsiaMarketingSourceItems(function (data) {
				me.setState({marketing_sources: data});
			});
			requestIsiaPersonalGoalItems(function (data) {
				me.setState({personal_goals: data});
			});
			var hash_tokens = window.location.hash.substr(1).split('-'),
				courseid = hash_tokens[0],
				sportid = hash_tokens[1];
			requestIsiaCourse(courseid, function (data) {
				me.setState({course: data});
				if (data.is_active != 'true' || (data.reg_after != 'true' && new Date() > data.sport_eventfinish_date)) {
					window.location.href = 'calendar.html';
				}
				for (var i=0; i < data.sports.length; i++) {
					var sport = data.sports[i];
					if (sport.id == sportid && sport.enabled == 'true') return;
				}
				window.location.href = 'calendar.html';
			});
		},

		// onUpdateFullname: function(last_name, first_name, middle_name) {
		// 	this.fullnameLatin.updateNames(last_name, first_name);
		// },

		render: function () {
			var signup = ((this.props.authorised || !this.props.showSignup) ? "" : <Signup />);
			var fieldset = <GeneralFieldset {...this.state} signup={signup} />;
			if (formtype == 'sport_academy') fieldset = <SportAcademyFieldset {...this.state} signup={signup} />;
			else if (formtype == 'mastership_school') fieldset = <MastershipFieldset {...this.state} signup={signup} />;
			return fieldset;
		}
	});

	var OrderRetakeFieldset = React.createClass({
		getInitialState: function () {
			return {
				languages: [{code: 'ru', name: 'Русский'}, {code: 'en', name: 'Английский'}, {code: 'de', name: 'Немецекий'}, {code: 'lt', name: 'Литовский'}],
				regions: [],
				cities: [],
				past_courses: [],
				future_courses: []
			};
		},

		componentDidMount: function () {
			var me = this;
			requestIsiaCourseListGet_API(function(data) {
				me.setState({
					past_courses: me.preparePastCourses(data),
					future_courses: me.prepareFutureCourses(data)
				});
			});
		},

		preparePastCourses: function(data) {
			var now = new Date();
			return prepareGroups(data, function(line) {
				return (line.sport_eventfinish_date < now) && (line.sport_event_groupcan_retake == 'true');
			});
		},


		prepareFutureCourses: function(data) {
			var now = new Date();
			return prepareGroups(data, function(line) {
				if (line.sport_event_groupcan_retake != 'true') return false;
				if (addDays(line.sport_eventfinish_date, 5) <= now) return false;
				for (var i=0; i<line.sports.length; i++) {
					if (line.sports[i].enabled == 'true') return true;
				}
			});
		},

		render: function () {
			var confirmationLabel = 'Я соглашаюсь с условиями <a href="https://www.isiarussia.ru/wp-content/uploads/plzh.pdf" target="_blank">Положения «О порядке подготовки и подтверждения категорий инструкторов по горнолыжному спорту и сноуборду»</a>.',
				additionalConfirmation = '';
			// if (this.state.course.sport_event_groupdoc_label != undefined && this.state.course.sport_event_groupdoc_label.length > 0) {
			// 	additionalConfirmation = <Fields.Checkbox required={true} name='agreed2' label={this.state.course.sport_event_groupdoc_label} />;
			// }
			var sports = [
				{id: 1, name: 'Горные лыжи'},
				{id: 2, name: 'Сноуборд'}
			];
			var unauth_fields = (
				<div>
					<Fields.Fullname required={true} />
					<Fields.Gender required={true} />
					<Fields.Birthdate required={true} />
					<hr/>
					<Fields.Address required={true} />
					<hr />
					<Fields.Phone name="phone1" required={true} label='Мобильный телефон' />
					<Fields.Phone name="phone2" label='Рабочий телефон'/>
					<Fields.Email required={true} />
					{this.props.showSignup &&
						<Signup />
					}
					<hr />
				</div>
			);
			var auth_fields = (
				<div>
					<Fields.CurrentPerson person={this.props.person} />
					<hr />
				</div>
			);
			var person_fields = (this.props.authorised ? auth_fields : unauth_fields);
			return (
				<div>
					<FormRetakeHeader />
					<input type="hidden" name="is_retake_order" value="true" />
					<Fields.CourseSelector required={false} name="retake_coursesport_eventid" label="Выберите Курс, на котором вы не сдали итоговое тестирование" options={this.state.past_courses} />
					<Fields.SelectorOther name="retake_course_other" label="Моего курса нет в списке" />
					<Fields.CourseSelector required={true} name="courseid" label="Выберите Курс, на котором вы планируете осуществить пересдачу" options={this.state.future_courses} />
					<Fields.Sport required={true} sports={sports} />
					<RetakeTime />
					<RetakeSubject required={true} />
					<DrivingDays />
					{person_fields}
					<Captcha name="captcha" required={true} />
					{additionalConfirmation}
					<Fields.Checkbox required={true} name="agreed" label={confirmationLabel} />
				</div>
			);
		}
	});

	var OrderRevalidationFieldset = React.createClass({
		getInitialState: function () {
			return {
				regions: [],
				cities: [],
				past_courses: [],
				future_courses: []
			};
		},

		componentDidMount: function () {
			var me = this;
			requestIsiaCourseListGet_API(function(data) {
				me.setState({
					past_courses: me.preparePastCourses(data),
					future_courses: me.prepareFutureCourses(data)
				});
			});
		},

		preparePastCourses: function(data) {
			var now = new Date();
			return prepareGroups(data, function(line) {
				return line.sport_eventfinish_date < now;
			});
		},


		prepareFutureCourses: function(data) {
			var now = new Date();
			return prepareGroups(data, function(line) {
				if (addDays(line.sport_eventfinish_date, 5) <= now) return false;
				for (var i=0; i<line.sports.length; i++) {
					if (line.sports[i].enabled == 'true') return true;
				}
			});
		},

		render: function () {
			var confirmationLabel = 'Я соглашаюсь с условиями <a href="https://www.isiarussia.ru/wp-content/uploads/plzh.pdf" target="_blank">Положения «О порядке подготовки и подтверждения категорий инструкторов по горнолыжному спорту и сноуборду»</a>.',
				additionalConfirmation = '';
			// if (this.state.course.sport_event_groupdoc_label != undefined && this.state.course.sport_event_groupdoc_label.length > 0) {
			// 	additionalConfirmation = <Fields.Checkbox required={true} name='agreed2' label={this.state.course.sport_event_groupdoc_label} />;
			// }
			var sports = [
				{id: 1, name: 'Горные лыжи'},
				{id: 2, name: 'Сноуборд'}
			];
			var unauth_fields = (
				<div>
					<Fields.Fullname required={true} />
					<Fields.Gender required={true} />
					<Fields.Birthdate required={true} />
					<hr/>
					<Fields.Address required={true} />
					<hr />
					<Fields.Phone name="phone1" required={true} label='Мобильный телефон' />
					<Fields.Phone name="phone2" label='Рабочий телефон'/>
					<Fields.Email required={true} />
					{this.props.showSignup &&
						<Signup />
					}
					<hr />
				</div>
			);
			var auth_fields = (
				<div>
					<Fields.CurrentPerson person={this.props.person} />
					<hr />
				</div>
			);
			var person_fields = (this.props.authorised ? auth_fields : unauth_fields);
			return (
				<div>
					<FormRevalidationHeader />
					<input type="hidden" name="is_revalidation_order" value="true" />
					<Fields.CourseSelector required={false} name="retake_coursesport_eventid" label="Выберите Курс, на котором вы не сдали итоговое тестирование" options={this.state.past_courses} />
					<Fields.SelectorOther name="retake_course_other" label="Моего курса нет в списке" />
					<Fields.CourseSelector required={true} name="courseid" label="Выберите Курс, на котором вы планируете осуществить пересдачу" options={this.state.future_courses} />
					<Fields.Sport required={true} sports={sports} />
					<DrivingDays />
					{person_fields}
					<Captcha name="captcha" required={true} />
					{additionalConfirmation}
					<Fields.Checkbox required={true} name="agreed" label={confirmationLabel} />
				</div>
			);
		}
	});


	var OrderFormApp = React.createClass({
		getInitialState: function() {
			if (!window.location.hash && formtype != 'retake' && formtype != 'revalidation') {
				window.location.href = 'calendar.html';
				return null;
			}
			let showState = this.showFormState();
			//if (!formtype || formtype == 'mastership_school') showState = this.showAuthState();
			return {
				authorised: false,
				person: undefined,
				showSignup: false,
				...showState
			}
		},

		showAuthState: function() {
			return {
				showSignup: false,
				showAuth: true,
				showForm: false,
				showSuccess: false
			};
		},
		showFormState: function() {
			return {
				showAuth: false,
				showForm: true,
				showSuccess: false
			};
		},
		showSuccessState: function() {
			return {
				showAuth: false,
				showForm: false,
				showSuccess: true
			};
		},

		startValidation() {
			var me = this;
			jQuery(this.refs.orderForm).validate({
				submitHandler: me.onSubmitOrder,
				ignore: ".tt-hint",
				rules: {
					password: {required: true, minlength: 3},
					password2: {required: true, minlength: 3}
				}
			});
		},
		componentDidMount() {
			this.startValidation();
			loadCaptcha();
		},
		componentDidUpdate() {
			this.startValidation();
			loadCaptcha();
		},



		onSignin: function(person) {
			var me = this;
			this.setState({
				authorised: true, 
				person: person,
				...this.showFormState()
			});
		},
		chooseOrderWithSignup: function() {
			this.setState({
				authorised: false,
				showSignup: true,
				...this.showFormState()
			});
		},
		chooseOrderNoSignup: function() {
			this.setState({
				authorised: false,
				showSignup: false,
				...this.showFormState()
			});
		},

		onSubmitOrder: function(form, e) {
			e.preventDefault();
			let me = this;
			// if (!form.valid()) return;
			
			// console.log(jQuery(this).serializeTypedArray());
			var data = jQuery('#order-form').serializeAURL();
			data += 'birthdate=ADate:s:' + format_effi_date(getBirthdate()) + '&&';
			if (formtype != 'retake' && formtype != 'revalidation') {
				let hash_token = window.location.hash.split('-'),
					courseid = hash_token[0].substr(1),
					sportid = hash_token[1];
				data += 'courseid=i:' + courseid + '&' + 'sportid=i:' + sportid + '&';
			}
			        
			var url = '/nologin/srv/Isia/IsiaCourseOrder/Place_API';
			if (this.state.authorised) url = '/srv/Isia/IsiaCourseOrder/MyPlace_API';

			effi.request({
				url: url,
				data: data,
				success: function (result) {
					me.setState({
						...me.showSuccessState(),
						orderNumber: result.id
					});
					window.dataLayer = window.dataLayer || [];
				    window.dataLayer.push({
				        event: 'send_order',
				    })
					jQuery('#order_number').html(result.id);
				},
				error: function (error) {
					jQuery('#error-modal-body').html(error.ExceptionText);
					jQuery('#error-modal').modal();
				}
			});
		},

		render: function() {
			var fieldset;
			if (formtype == 'retake') {
				fieldset = <OrderRetakeFieldset authorised={this.state.authorised} person={this.state.person} showSignup={this.state.showSignup} />;
			}
			else if (formtype == 'revalidation') {
				fieldset = <OrderRevalidationFieldset authorised={this.state.authorised} person={this.state.person} showSignup={this.state.showSignup} />;
			}
			else {
				fieldset = <OrderFieldset authorised={this.state.authorised} person={this.state.person} showSignup={this.state.showSignup} />;
			}

			return (
			<div>
				{this.state.showAuth &&
					<div id="auth-form">
						<Signin onSignin={this.onSignin} chooseOrderWithSignup={this.chooseOrderWithSignup} chooseOrderNoSignup={this.chooseOrderNoSignup} />
					</div>
				}

				{this.state.showForm &&
					<div>
						<form id="order-form" className="validated-form form-horizontal " role="form" method="post" ref="orderForm">
							{fieldset}
		 					<br/><br/>
							<button className="btn btn-primary btn-lg button-submit-order" type="submit">Отправить заявку</button>
						</form>
						
					</div>
				}

				{this.state.showSuccess &&
					<div id="success-result" >
						<p>Ваша заявка №<span id="order_number">{this.state.orderNumber}</span> отправлена координатору курсов.</p>
						<p>На указанный вами адрес отправлено письмо с номером вашей заявки, датами выбранного курса и с дальнейшими вашими действиями! 
						Просьба внимательно ознакомиться с письмом.</p>
						<p style={{fontStyle: 'italic', color: 'red'}}>
							Обращаем Ваше внимание на то, что оплату квитанции производить строго по назначению платежа, указанному в ней: 
							'На организацию курса по договору (публичная оферта) от 01 июня 2017 года'.
							В случае, поступления денежных средств на расчетный счет НЛИ с другим назначением платежа, мы не сможем Вас зачислить в группу.
						</p>
					</div>
				}

				<ModalDialog htmlid="error-modal" caption="Ошибка при отправлении заявки" />
			</div>
			);
			//<FormInfo />
		}
	});

	var workflowid = 1, effi = new EffiProtocol({host: baseurl});

	function prepareGroups(data, filter) {
		var groups = {}, groupsCache = [];
		for (var i in data.sort(function(a,b) { return a.sport_eventstart_date-b.sport_eventstart_date; })) {
			var line = data[i],
				id = line.sport_event_groupid;
			if (!filter(line)) continue;
			if (!(id in groups)) {
				groups[id] = {
					id: id,
					name: line.sport_event_groupname,
					name_en: line.sport_event_groupname_en,
					color: line.sport_event_groupcolor,
					position: line.sport_event_groupposition,
					events: []
				};
				groupsCache.push(line);
			}
			groups[id].events.push(line);
		}
		var result = [];
		groupsCache.sort(function(a,b) { return a.sport_event_groupposition-b.sport_event_groupposition; }).map(function(v, i) {
			result.push(groups[v.sport_event_groupid]);
		});
		return result;
	}

	function requestPerson(fn, error) {
		effi.request({
			url: '/srv/Computerica/Person/MyGet',
			success: fn,
			error: error
		});
	}
	function requestLanguages(fn) {
		effi.request({
			url: '/nologin/srv/Computerica/Language/LanguageListGet_API',
			success: fn
		});
	}
	function requestRegions(fn) {
		effi.request({
			url: '/nologin/srv/Computerica/Region/RegionListGet_API',
			success: fn
		});
	}
	function requestCities(fn) {
		effi.request({
			url: '/nologin/srv/Computerica/City/CityListGet_API',
			success: fn
		});
	}
	function requestIsiaInstructors(fn) {
		effi.request({
			url: '/nologin/srv/Isia/IsiaInstructor/IsiaInstructorListGet_API',
			success: fn
		});
	}
	function requestIsiaMarketingSourceItems(fn) {
		effi.request({
			url: '/nologin/srv/Isia/IsiaMarketingSourceItem/IsiaMarketingSourceItemListGet_API',
			success: fn
		});
	}
	function requestIsiaPersonalGoalItems(fn) {
		effi.request({
			url: '/nologin/srv/Isia/IsiaPersonalGoalItem/IsiaPersonalGoalItemListGet_API',
			success: fn
		});
	}
	function requestIsiaCourse(courseid, fn) {
		effi.request({
			url: '/nologin/srv/Isia/IsiaCourse/Get_API',
			data: 'id=i:' + courseid + '&',
			success: fn
		});
	}
	function requestIsiaCourseListGet_API(fn, hideDisabled) {
		effi.request({
			data: (hideDisabled ? 'hideDisabled=s:true&' : ''),
			url: '/nologin/axml/Isia/IsiaCourse/IsiaCourseListGet_API',
			success: fn
		});
	}

	function getBirthdate() {
		var year = jQuery('#birthdate_year_id').val(),
			month = jQuery('#birthdate_month_id').val(),
			day = jQuery('#birthdate_day_id').val();
		return new Date(year, month, day);
	}

	let orderApp = ReactDOM.render(
		<OrderFormApp />,
		document.getElementById(htmlid)
	);

}
