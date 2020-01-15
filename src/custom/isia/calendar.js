import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap';
import { EffiProtocol, prepareDataList } from '../../lib/effi_protocol';

window.IsiaCalendar = function(htmlid, baseurl, orderurl, calendarid, widget_view, multicalendar_view) {
	// const MAX_CATEGORIES = 6;
	// const MAX_EVENT_LINES = 7;
	orderurl = orderurl || '';
	var effi = new EffiProtocol({host: baseurl});
	var workflowid = 44;

	if (typeof String.prototype.startsWith != 'function') {
		String.prototype.startsWith = function (str) {
			return this.indexOf(str) === 0;
		};
	}

	if(!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(needle) {
			for(var i = 0; i < this.length; i++) {
				if(this[i] === needle) {
					return i;
				}
			}
			return -1;
		};
	}

	function paddy(n, p, c) {
		var pad_char = typeof c !== 'undefined' ? c : '0';
		var pad = new Array(1 + p).join(pad_char);
		return (pad + n).slice(-pad.length);
	}
	function utc_to_local(date) {
		var offset = -180 * 60000; //date.getTimezoneOffset() * 60000;
		return new Date(date - offset);
	}
	function format_ru_date(date_) {
		if (date_ == null) return null;
		var date = utc_to_local(date_);
		return paddy(date.getDate(), 2) + '.' + paddy(date.getMonth()+1, 2) + '.' + paddy(date.getFullYear(), 4);
	}
	function formatMoney(n, c, d, t){
		var n = parseFloat(n), 
			c = isNaN(c = Math.abs(c)) ? 2 : c, 
			d = d == undefined ? "." : d, 
			t = t == undefined ? "," : t, 
			s = n < 0 ? "-" : "", 
			i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
			j = (j = i.length) > 3 ? j % 3 : 0;
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	};
	function getCourseOrderKey(line) {
		return String(line.sport_eventid)+'-'+String(line.sportid);
	}

	function requestIsiaCourseListGet_API(calendarid, fn) {
		effi.request({
			url: '/nologin/axml/Isia/IsiaCourse/IsiaCourseListGet_API?workflowid=i:'+workflowid+'&calendarid=i:'+calendarid+'&',
			success: fn
		});
	}

	function requestSportEventGroupCalendarListGet_API(calendarid, cb) {
		effi.request({
			url: '/nologin/axml/Computerica/SportEventGroupCalendar/ListGet_API?calendarid=i:'+calendarid+'&',
			success: (data) => {
			 	cb(data); 
			},
			error: () => {alert("/nologin/axml/Computerica/SportEventGroupCalendar/ListGet_API error");}
		});
	}

	function requestDefaultWorkflow_API(fn) {
		effi.request({
			url: '/nologin/axml/Computerica/Workflow/GetDefaultWorkflow_API',
			success: fn
		});
	}

	class CommentBox extends React.Component {
		render() {
			return(
				<div className="isia-event-line-comment">
					Доп. расходы участника
					<div dangerouslySetInnerHTML={{__html: this.props.comment}}/>
				</div>
			)
		}
	}

	class EventLineSport extends React.Component {
		getKey = () => {
			return this.props.line.id + '-' + this.props.sport.id;
		}

		render() {
			var line = this.props.line,
				sport = this.props.sport,
				key = this.getKey(),
				order_href = orderurl + '#' + key;
			var order_link_label = <span className="course-finished">Набор завершён</span>;
			if (sport.enabled == 'true') {
				order_link_label = <a href={order_href}>{sport.name}</a>;
			}
			return <tr key={key}><td>{order_link_label}</td></tr>;
		}
	}

	class EventLine extends React.Component{
		constructor(props) {
			super(props);
			this.state = {
				showComment: false,
			};
		}

		handleClickComment = (e) => {
			e.preventDefault();
			jQuery('#comment-modal-body').html(this.props.item.comment);
			jQuery('#comment-modal').modal();
		}

		handleMouseEnter = (e) => {
			this.setState({showComment: true});
		}

		handleMouseLeave = (e) => {
			this.setState({showComment: false});
		}

		render() {
			var line = this.props.item,
				price = line.price,
				sports = line.sports || [],
				// color = line.sport_event_groupcolor || "#ddd",
				border = "none", //"1px solid " + color,
				comment = null;
			if (this.state.showComment) {
				comment = (
					<div className="isia-calendar-line-comment-container">
						<CommentBox comment={line.comment} />
					</div>
				)
			}
			if (line.price > 0) price = formatMoney(line.price, 0, ',', ' ') + ' руб.';
			else if (line.price_euro > 0) price = formatMoney(line.price_euro, 0, ',', ' ') + ' EUR';
			else price = "Уточняется";
			let highlighted = (this.props.highlighted.groupid == this.props.groupid && this.props.highlighted.courseid == line.id) ? " highlighted" : "";
			return (
				<tr className={"isia-calendar-line" + highlighted}>
					{/*<td style={{backgroundColor: color, fontWeight: "bold"}} width="219">{line.sport_eventname}</td>*/}
					<td className="dates" style={{borderTop: border}}>{format_ru_date(line.sport_eventstart_date)} &rarr; {format_ru_date(line.sport_eventfinish_date)}</td>
					<td className="location" style={{borderTop: border}}>{line.locationname}</td>
					<td className="price" style={{borderTop: border}}>{price}</td>
					<td className="addition" style={{borderTop: border}}>
						<a id={"course" + this.props.groupid + '-' + line.id} href={"#" + this.props.calendarid + "-" + this.props.groupid + "-" + line.id} onClick={this.handleClickComment} 
						onMouseLeave={this.handleMouseLeave} onMouseEnter={this.handleMouseEnter}>
							подробнее
						</a>
						{comment}
					</td>
					<td className="select-container" style={{borderTop: border, borderRight: border}}>
						<table className="select-event-links">
						<tbody>
						{sports.map(function (sport, i) {
							var key = line.id + '-' + sport.id;
							return <EventLineSport line={line} sport={sport} key={key} />
						}, this)}
						</tbody>
						</table>
					</td>
				</tr>
			);
		}
	};

	class EventGroup extends React.Component {

		componentDidMount() {
			if(this.props.openSchedule) this.openSchedule();
			else this.closeSchedule();
		}

		componentWillReceiveProps(nextProps) {
			if(nextProps.openSchedule) this.openSchedule();
			else this.closeSchedule();
		}

		toggleSchedule = (e) => {
			jQuery("#isia-calendar-event-schedule-"+this.props.group.id).slideToggle("slow");
			e.preventDefault();
		}

		openSchedule = () => {
			jQuery("#isia-calendar-event-schedule-"+this.props.group.id).slideDown("slow");
		}

		closeSchedule = () => {
			jQuery("#isia-calendar-event-schedule-"+this.props.group.id).slideUp("slow");
		}

		render() {
			var group = this.props.group,
				events = group.events || [],
				color = group.color || "#ddd",
				border = '1px solid ' + color,
				flip_class = "flip_01";
			console.log("EVENTS: ", events.length);
			var markup = <div className="isia-calendar-event-description"><h2>{group.name}</h2></div>;
			if (group.markup) {
				markup = <div className="isia-calendar-event-description" dangerouslySetInnerHTML={{ __html: group.markup }} />;
				flip_class += " markuped";
			}
			return (
				<div className="isia-calendar-event-container" id={`isia-calendar-event-${group.id}`}>
					{markup}
					<a className={flip_class} id={"group" + this.props.group.id} href={"#" + this.props.calendarid + "-" + group.id} onClick={this.toggleSchedule}>☰ Открыть календарь</a>
					<div className="clearfix"></div>
					<div className={"isia-calendar-event-schedule-container"} id={`isia-calendar-event-schedule-${group.id}`}>
						<table className="isia-calendar-event-schedule">
						<tbody>
							{events.map(function (line, i) {
								return <EventLine key={line.id} highlighted={this.props.highlighted} calendarid={this.props.calendarid} groupid={group.id} item={line}/>
							}, this)}
							<tr key={"close-btn"} class="isia-schedule-close-btn"><td colSpan={5}><a class="flip_01_back" href="#" onClick={this.toggleSchedule}>☰ Закрыть календарь</a></td></tr>
						</tbody>
						</table>
					</div>
					{this.props.drawSplitter ? <div className="isia-calendar-event-separator"></div> : null}
				</div>


			);
		}
	}

	class EventLink extends React.Component {
		handleLinkClick = () => {
			document.getElementById('isia-calendar-event-'+this.props.group.id).scrollIntoView();
			jQuery("#isia-calendar-event-schedule-"+this.props.group.id).slideDown("slow");
		}

		render() {
			return (
				<div className="isia-event-link" onClick={this.handleLinkClick}><span>›</span> {this.props.group.name}</div>
			)
		}
	}

	class ModalDialog extends React.Component {
		render() {
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
	};

	class EventsApp extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				openAll: false,
				calendarid: 0,
				groupid: 0,
				courseid: 0
			}
			let params = this.getCalendarIdFromHash(props);
			this.state.calendarid = params[0];
			this.state.groupid = params[1];
			this.state.courseid = params[2];
		}

		getCalendarIdFromHash = (props) => {
			let calendarid_ = calendarid;
			let groupid = 0;
			let courseid = 0;
			if (window.location.hash) {
				let r = /#(\d*)-?(\d*)-?(\d*)/;
				let parts = window.location.hash.match(r);
				console.log("parts: ", parts);
				calendarid_ = parseInt(parts[1]);
				if(isNaN(calendarid_)) calendarid_ = 0;
				groupid = parseInt(parts[2]);
				if(isNaN(groupid)) groupid = 0;
				courseid = parseInt(parts[3]);
				if(isNaN(courseid)) courseid = 0;
			}
			return [calendarid_, groupid, courseid];
		}

		findCurrentCalendar = () => {
			for (let i=0; i < this.props.calendars.length; i++) {
				let cal = this.props.calendars[i];
				if (cal.calendarid == this.state.calendarid) return cal;
			}
			return 0;
		}

		componentDidMount() {
			window.addEventListener("hashchange", this.onHashChange, false);
			if(this.state.groupid != 0 && this.state.courseid == 0){
				jQuery('html, body').animate({
					scrollTop: jQuery("#group" + this.state.groupid).offset().top - 20
				}, 1000);
			} else if (this.state.groupid != 0 && this.state.courseid != 0) {
				jQuery('html, body').animate({
					scrollTop: jQuery("#course" + this.state.groupid  + '-' + this.state.courseid).offset().top - 20
				}, 1000);
			}
		}

		componentWillUnmount() {
			window.removeEventListener("hashchange", this.onHashChange, false);
		}

		onHashChange = (e) => {
			if (multicalendar_view) {
				this.setState({
					calendarid: this.getCalendarIdFromHash(this.props)[0],
					groupid: this.getCalendarIdFromHash(this.props)[1],
					courseid: this.getCalendarIdFromHash(this.props)[2]
				});
			}
		}

		openAllClick = () => {
			this.setState({openAll: !this.state.openAll});
		}

		render() {
			let groups = this.props.groups || [];
			console.log("EVENT GROUPS: ", groups);
			let filtered_groups = groups;
			let cal = null;
			if (multicalendar_view) {
				filtered_groups = [];
				cal = this.findCurrentCalendar();
				setCalendarTitle(cal.name);
				for (let i=0; i < groups.length; i++) {
					for (let j=0; j < cal.groups.length; j++) {
						if (groups[i].id == cal.groups[j].id) {
							filtered_groups.push(groups[i]);
							break;
						}
					}
				}
			}
			const highlighted_course = {groupid: this.state.groupid, courseid: this.state.courseid};
			return (
				<div>
					{multicalendar_view && (
						<div>
							<CalendarMenu calendars={this.props.calendars} current_calendarid={cal.calendarid} />
						</div>
					)}
					<div className="isia-event-quick-links-wrapper">
						<div className="isia-event-quick-links highlighted">
							{filtered_groups.map(function (group, i) {
								return <EventLink key={group.id} group={group} />;
							}, this)}
							{filtered_groups.length > 0 ? (<div className="isia-event-link" onClick={this.openAllClick}><span>›</span> Открыть все календари</div>) : null}
						</div>
					</div>
					{filtered_groups.map(function (group, i) {
						let splitter = filtered_groups.length != i + 1 ? true : false;
						return <EventGroup openSchedule={this.state.openAll || this.state.groupid == group.id} key={group.id} 
											calendarid={this.state.calendarid} group={group} drawSplitter={splitter} highlighted={highlighted_course}/>;
					}, this)}
					{filtered_groups.length == 0 ? (<h2 class="empty-calendar">В данном календаре нет запланированных курсов</h2>) : null}
					<ModalDialog htmlid="comment-modal" caption="Доп. расходы участника" />
				</div>
			);
		}
	};

	class WidgetEventGroup extends React.Component{
		render() {
			var group = this.props.group,
				events = group.events || [];
				// events = events.slice(0, MAX_EVENT_LINES);
			return (
				<div className="vc_tta-panel-body">
					<div className="wpb_text_column wpb_content_element ">
						<div className="wpb_wrapper">
							<div className="table-responsive">
								<table style={{"width": "100%",  "marginLeft":"auto", "marginRight":"auto"}} className="easy-table easy-table-cuscosky ">
									<thead>
										<tr>
											<th style={{"textAlign": "left"}}>Сроки курса</th>
											<th style={{"textAlign": "left" }}>Место проведения</th>
										</tr>
									</thead>
									<tbody>
										{events.map(function (line, i) {
											return (
												<tr key={i}>
													<td style={{"textAlign":'left'}}>{format_ru_date(line.sport_eventstart_date)} &rarr; {format_ru_date(line.sport_eventfinish_date)}</td>
													<td style={{"textAlign":'left'}}>{line.locationname}</td>
												</tr>
											);
										}, this)}
									</tbody>
								</table>
							</div>
							<a href="http://kabinet.isiarussia.ru/custom/isia/calendar.html" className="btn-shortcode dt-btn-m btn-link title-btn-color accent-btn-hover-color default-btn-bg-color default-btn-bg-hover-color fadeIn animate-element animation-builder animation-triggered start-animation" id="dt-btn-7"><i className="fa fa-chevron-circle-right"></i><span>Подробнее</span></a>
						</div>
					</div>
				</div>
			);
		}
	}

	class CalendarWidget extends React.Component {

		onClick = (event) => {
			jQuery(".vc_tta-tab.vc_active").removeClass("vc_active");
			jQuery(event.target).closest('li').addClass("vc_active");
			var val = jQuery(event.target).closest('li').attr("value");
			jQuery(".vc_tta-panel.vc_active").removeClass("vc_active");
			jQuery("#group_panel_"+ val).addClass("vc_active");
		}

		render() {
			let groups = this.props.groups || [];
			// groups = groups.slice(0, MAX_CATEGORIES);
			return (
				<div className="vc_general vc_tta vc_tta-tabs vc_tta-color-peacoc vc_tta-style-classic vc_tta-shape-rounded vc_tta-spacing-5 vc_tta-gap-5 vc_tta-tabs-position-left vc_tta-controls-align-left ">
					<div className="vc_tta-tabs-container">
						<ul className="vc_tta-tabs-list">
						{groups.map(function (group, i) {
							var tabClass = "vc_tta-tab";
							if(i == 0) tabClass = "vc_tta-tab vc_active";
							return (
								<li className={tabClass} value={group.id} data-vc-tab="" key={group.id}>
									<a href="#"  onClick={this.onClick}>
										<i className="vc_tta-icon fa fa-spinner"></i><span className="vc_tta-title-text">{group.name}</span>
									</a>
								</li>
							);
						}, this)}
						</ul>
					</div>

					<div className="vc_tta-panels-container">
						<div className="vc_tta-panels">
							{groups.map(function (group, i){
								var panelClass = "vc_tta-panel";
								if(i == 0) panelClass = "vc_tta-panel vc_active";
								return(
									<div className={panelClass} id={"group_panel_" + group.id} key={group.id} data-vc-content=".vc_tta-panel-body">
										<div className="vc_tta-panel-heading">
											<h4 className="vc_tta-panel-title">
												<a href="#1481302334191-c7f61a00-3b54" data-vc-accordion="" data-vc-container=".vc_tta-container">
													<i className="vc_tta-icon fa fa-spinner"></i>
													<span className="vc_tta-title-text">{group.name}</span>
												</a>
											</h4>
										</div>
										{<WidgetEventGroup group={group} />}
									</div>
								)
							}, this)}
							
						</div>
					</div>
				</div>
			)
		}
	};

	class CalendarMenu extends React.Component {
		render() {
			let props = this.props;
			return (
				<div className="isia-event-quick-links">
				{this.props.calendars.map(function(v, i) {
					let cls = "isia-event-link main";
					if (v.calendarid == props.current_calendarid) cls += " selected";
					const hashurl = '#' + v.calendarid;
					return <div className={cls} key={v.calendarid}><span>›</span><a href={hashurl} >{v.name}</a></div>;
				})}
				</div>
			);
		}
	};

	function prepareGroups(data) {
		var groups = {}, groupsCache = [];
		if (data) for (var i in data.sort(function(a,b) { return a.sport_eventstart_date-b.sport_eventstart_date; })) {
			var line = data[i],
				id = line.sport_event_groupid;
			if (!(id in groups)) {
				groups[id] = {
					id: id,
					name: line.sport_event_groupname,
					name_en: line.sport_event_groupname_en,
					color: line.sport_event_groupcolor,
					position: line.sport_event_groupposition,
					markup: line.sport_event_groupmarkup,
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

	function renderApp(groups, calendars) {
		let widget = (widget_view ? <CalendarWidget groups={groups} /> : <EventsApp groups={groups} calendars={calendars} />)
		ReactDOM.render(
			widget,
			document.getElementById(htmlid)
		);
	}

	function renderMenu(calendars) {
		ReactDOM.render(
			<CalendarMenu calendars={calendars} />,
			document.getElementById(htmlid + '-calendars-menu')
		);
	}

	function setCalendarTitle(title) {
		let h = document.getElementById(htmlid + '-calendar-title');
		if (h) h.innerText = title;
	}

	requestDefaultWorkflow_API(function (data) {
		workflowid = data['id'];
		requestIsiaCourseListGet_API(calendarid, function (data) {
			var groups = prepareGroups(data);
			if (multicalendar_view) {
				requestSportEventGroupCalendarListGet_API(calendarid, (calendars) => {
					// renderMenu(calendars);
					renderApp(groups, calendars);
				});
			}
			else renderApp(groups);
		});
	});
}
