import React from 'react';
import ReactDOM from 'react-dom';
import Formsy from 'formsy-react';
import { HOC } from 'formsy-react';

import { Input, Textarea, Checkbox, Select, Option } from 'formsy-react-components'
import injectTapEventPlugin from 'react-tap-event-plugin';
import { FILTERS } from './stores/filters-store';

import { EffiProtocol, serializeAURL, serializeAURLAsync } from './lib/effi_protocol';
// import './styles/register-form.less';

injectTapEventPlugin();

let effi = new EffiProtocol();

let theme = {
      fontFamily: "'WhitneyLight', Arial, Helvetica, sans-serif",
      palette: {
        primary1Color: '#cac9c9',
        primary2Color: '#D32F2F',
      }
    };

window.RenderSchedule = function(htmlid, opts) {
	let domNode = document.getElementById(htmlid);
	const baseurl = opts.baseurl || "";
	ReactDOM.render(
		<EventSchedule />, 
		domNode);
}

function padz(v, length) {
	length = length || 2;
	let s = v.toString();
	let r = '';
	if (s.length < length) {
		for (let i=0; i<(length-s.length); i++) {
			r = r + '0';
		}
	}
	return r + s;
}


function copyData(data) {
	let res = [];
	for (let i = 0; i < data.length; i++) {
		let row = {};
		for (let key in data[i]) {
			row[key] = data[i][key];
		}
		res.push(row);
	}
	return res;
}

function sortByBeginDate(data) {
	let res = data.sort((a,b) => {
		return (a[Object.keys(a)[0]][0].start_date - b[Object.keys(b)[0]][0].start_date);
	});
	return res;
}


function dateToLocalString(date) {
	if(!date) return "";
	date = new Date(date);
	date.setHours(date.getHours() + 4);
	const day = padz(date.getDate());
	const monthIndex = padz(date.getMonth() + 1);
	const year = date.getFullYear();
	return day + "." + monthIndex + "." + year;
}

function dictByProperty (data, property) {
	let res = {};
	for (let i = 0; i < data.length; i++) {
		if(Array.isArray(res[data[i][property]])) res[data[i][property]].push(data[i]);
		else res[data[i][property]] = [data[i]];
	}
	return res;
}

function objToArray(obj) {
	let res = [];
	for(let key in obj) {
		res.push(obj[key]);
	}
	return res;
}


class EventSchedule extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			data: {},
			filters: FILTERS,
			received: false,
		}
	}

	formatData = (data) => {
		let events = copyData(data);
		events = dictByProperty(events, "coursesport_eventid");
		events = objToArray(events);
		for(let i = 0; i < events.length; i++) {
			events[i] = dictByProperty(events[i], "sportname");
		}

		return events;
	}

	componentDidMount() {
		this.requestData();
	}

	validateRowData = (row) => {
		/*if(!row.instructorid.value) {
			alert("Невозможно обновить запись, отсутствует поле 'Лектор'");
			return false;
		}*/
		if(!row.coursesport_eventid.value) {
			alert("Невозможно обновить запись, отсутствует поле 'Мероприятие'");
			return false;
		}
		if(!row.sportid.value) {
            alert("Невозможно обновить запись, отсутствует поле 'Спортивная дисциплина'");
            return false;
		}
		return true;
	}

	requestData = () => {
		let me = this;
		effi.request({
			url: '/srv/Isia/IsiaCourseChecklist/IsiaCourseChecklistPreparedListGet_API',
			success: (data) => {
				me.setState({
					data: data,
					received: true
				});
			},
			error: (res) => {
				alert(res.ExceptionText);
			}
		});
	}

	requestSubmit = (data) => {
		if(!this.validateRowData(data)) return;
		let me = this;
        if (data.instructorid.value == "") {
            data.instructorid = null;
        }
        console.log(data);
		let serialized = serializeAURL(data);
        console.log(serialized);
		effi.request({
			url: '/srv/Isia/IsiaCourseChecklist/IsiaCourseChecklistRowSave_API',
			data: serialized,
			success: (data) => {
				console.log("success");
				// this.requestSuccess();
			},
			error: (res) => {
				alert(res.ExceptionText);
			}
		});
	}

	changeFilter = (value, type, field) => {
		this.requestData();
		let filters = this.state.filters;
		filters[field].value = value;
		this.setState({filters: filters});
	}

	filterValue = (value, filter) => {
		let fVal = filter.value;
		if(fVal == "" || fVal == "default") return false;

		if(filter.type == "checkbox") {
			if(fVal == "false" && value == "") return false;
		}
		if(filter.type == "date") {
			if(fVal == "upcoming" && new Date(Date.now()) < new Date(value)) return false;
			if(fVal == "past" && new Date(Date.now()) > new Date(value)) return false;
			// value = dateToLocalString(value);
		}
		if(value.toString().toLowerCase().indexOf(fVal.toLowerCase()) >= 0) return false;
		
		return true;
	}

	applyFilter = () => {
		let res = [];
		const data = this.state.data;
		const filters = this.state.filters;

		for(let i = 0; i < data.length; i++) {
			let filtered = false;
			for (let key in filters) {
				if (this.filterValue(data[i][key], filters[key])) {
					filtered = true;
				}
			}
			if(!filtered) res.push(data[i]);
		}
		return res;
	}


	render() {
		let table = null;
		if(this.state.data && this.state.received){
			let filteredData = this.applyFilter();
			let data = this.formatData(filteredData);
			data = sortByBeginDate(data);
			table = (<EventTable data={data} sendRequest={this.requestSubmit} changeFilter={this.changeFilter}/>);
		}
		return(
			<div className="event-schedule">
				{table}
			</div>
		);
	}
}

class EventTable extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			data: this.props.data,
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({data: nextProps.data}, () => {this.forceUpdate()});
	}

	componentDidMount() {
		jQuery('.editable-table tbody').scroll(function(e) {
			jQuery('.editable-table thead').css("left", -jQuery(".editable-table tbody").scrollLeft());
			jQuery(".static-table tbody").scrollTop(jQuery(this).scrollTop());
		});
	}

	applyFilter = (value, type, field) => {
		this.props.changeFilter(value, type, field);
	}

	handleSubmitRow = (data) => {
		data = this.formatDataRowValues(data);
		let row = this.formatForSerializer(data);
		this.props.sendRequest(row);
	}

	formatForSerializer = (row) => {
		let res = {};
		for(let key in row) {
			res[key] = { type: typeof row[key], value: row[key] };
		}
		return res;
	}

	formatDataToRows = (data) => {
		let res = [];
		for(let i = 0; i < data.coursesport_eventid.length; i++){
			let row = {};
			for(let key in data){
				row[key] = data[key][i];
			}
			res.push(row);
		}
		return res;
	}

	formatDataRowValues = (row) => {
		for(let i in row){
			if(typeof row[i] == "undefined") row[i] = "";
			if(typeof row[i] == "boolean") row[i] = row[i].toString();
		}
		return row;
	}

	formatDataValues = (data) => {
		for(let i in data){
			for(let j in data[i]) {
				if(typeof data[i][j] == "undefined") data[i][j] = "";
				if(typeof data[i][j] == "boolean") data[i][j] = data[i][j].toString();
			}
		}
		return data;
	}

	calcRowsCount = (e) => {
		let count = 0;
		for(let key in e) {
			count += e[key].length;
		}
		return count;
	}

	getEventStruct = (mustRender, eventLength, start_date, finish_date, eventname, place) => {
		let res = [];
		if(mustRender){
			res.push(<td className="td-date" key={"e1"} rowSpan={eventLength}><div className="td-content">{dateToLocalString(start_date)}</div></td>);
			res.push(<td className="td-date" key={"e2"} rowSpan={eventLength}><div className="td-content">{dateToLocalString(finish_date)}</div></td>);
			res.push(<td className="td-name" key={"e3"} rowSpan={eventLength}><div className="td-content">{eventname}</div></td>);
			res.push(<td className="td-place" key={"e4"} rowSpan={eventLength}><div className="td-content">{place}</div></td>);
		}

		return res;
	}

	getSportStruct = (mustRender, sport, sportLength) => {
		if(mustRender) return (<td className="td-sport" key={"e5"} rowSpan={sportLength}><div className="td-content">{sport}</div></td>);
	}

	buildFixedTable = () => {
		const data = this.state.data;
		let res = [];
		let key = 0;
		let rowIndex = 0;
		for(let i = 0; i < data.length; i++) {
			let rowspan = this.calcRowsCount(data[i]);
			let nEv = 0;
			let ev = [];
			for(let sportName in data[i]) {

				let nSport = 0;
				for(let j=0; j < data[i][sportName].length; j++) {
					let nCell = 0;
					let row = data[i][sportName][j];

					const renderEvent = {
						mustRender: nEv==0,
						data: [row.start_date, row.finish_date, row.coursesport_eventname, row.locationname],
						rowspan: rowspan
					};
					const renderSport = {mustRender: nSport==0, data: sportName, rowspan: data[i][sportName].length};

					ev.push(
						<tr className="static-row">
							{this.getEventStruct(nEv == 0, rowspan, row.start_date, row.finish_date, row.coursesport_eventname, row.locationname)}
							{this.getSportStruct(nSport == 0, sportName, data[i][sportName].length)}
						</tr>
					)
					nEv++;
					nSport++;
				}
			}
			res.push(ev);
		}
		return res;
	}

	buildCoachRows = () => {
		const data = this.state.data;
		let res = [];
		let key = 0;
		let rowIndex = 0;
		for(let i = 0; i < data.length; i++) {
			let rowspan = this.calcRowsCount(data[i]);
			let nEv = 0;
			let ev = [];
			for(let sportName in data[i]) {

				let nSport = 0;
				for(let j=0; j < data[i][sportName].length; j++) {
					let nCell = 0;
					let row = data[i][sportName][j];

					const renderEvent = {
						mustRender: nEv==0,
						data: [row.start_date, row.finish_date, row.coursesport_eventname, row.locationname],
						rowspan: rowspan
					};
					const renderSport = {mustRender: nSport==0, data: sportName, rowspan: data[i][sportName].length};

					ev.push(
						<FormRow key={key++} renderEvent={renderEvent} renderSport={renderSport} index={rowIndex} row={row}
						  onChange={this.handleSubmitRow} />
					)
					nEv++;
					nSport++;
				}
			}
			res.push(ev);
		}
		return res;
	}

	render() {
		return(
				<div class="table-container">
				<div className="static-container">
					<table className="static-table">
						<thead>
							<tr className="static-header-row">
								<td rowSpan="1" class="td-date"><Filter type="select" field="start_date" submitFilter={this.applyFilter} /> Дата начала <Filter type="text" field="start_date" submitFilter={this.applyFilter} /></td>
								<td rowSpan="1" class="td-date">Дата окончания <Filter type="text" field="finish_date" submitFilter={this.applyFilter} /></td>
								<td rowSpan="1" class="td-name">Мероприятие <Filter type="text" field="coursesport_eventname" submitFilter={this.applyFilter} /> </td>
								<td rowSpan="1" class="td-place">Место проведения <Filter type="text" field="locationname" submitFilter={this.applyFilter} /></td>
								<td rowSpan="1" class="td-sport">Спортивная дисциплина <Filter type="text" field="sportname" submitFilter={this.applyFilter} /></td>
							</tr>
						</thead>
						<tbody>
							{this.buildFixedTable()}
						</tbody>
					</table>
				</div>
				<div className="editable-container">
					<table className="editable-table">
						<thead>
						<tr className="header-row">
							<td colSpan="14" className="grey">Дима</td>
							<td colSpan="8" className="green">Вероника</td>
							<td colSpan="7" className="orange">Отчеты</td>
						</tr>
						<tr>
							<td className="grey">Лекторы кто <Filter type="text" field="instructorname" submitFilter={this.applyFilter} /></td>
							<td className="grey">Камеры в наличии / у кого <Filter type="text" field="camera_owner" submitFilter={this.applyFilter} /></td>
							<td className="grey">Письмо по условиям отправлено да / нет  <Filter type="checkbox" field="tos_delivered" submitFilter={this.applyFilter} /></td>
							<td className="grey">Условия получены да / нет <Filter type="checkbox" field="tos_received" submitFilter={this.applyFilter} /></td>
							<td className="grey">Методички отправлены / кому <Filter type="text" field="manuals_delivered" submitFilter={this.applyFilter} /></td>
							<td className="grey">Документы для курса отправлены / кому <Filter type="text" field="docs_delivered" submitFilter={this.applyFilter} /></td>
							<td className="grey">Билеты <Filter type="text" field="tickets" submitFilter={this.applyFilter} /></td>
							<td className="grey">Трансфер <Filter type="text" field="transfer" submitFilter={this.applyFilter} /></td>
							<td className="grey">Жилье <Filter type="text" field="accomodation" submitFilter={this.applyFilter} /></td>
							<td className="grey">Зал <Filter type="text" field="hall" submitFilter={this.applyFilter} /></td>
							<td className="grey">Питание <Filter type="text" field="catering" submitFilter={this.applyFilter} /></td>
							<td className="grey">Скипасс <Filter type="text" field="skipass" submitFilter={this.applyFilter} /></td>
							<td className="grey">Удостоверения НЛИ изготовлены <Filter type="checkbox" field="nli_doc_released" submitFilter={this.applyFilter} /></td>
							<td className="grey">Удостоверения ВНИИФК изготовлены <Filter type="checkbox" field="vniifk_doc_released" submitFilter={this.applyFilter} /></td>

							<td className="green">Подтверждение курса / рассылка <Filter type="checkbox" field="confirmation" submitFilter={this.applyFilter} /></td>
							<td className="green">Количество участников <Filter type="text" field="qty" submitFilter={this.applyFilter} /></td>
							<td className="green">Количество пересдающих <Filter type="text" field="retake_qty" submitFilter={this.applyFilter} /></td>
							<td className="green">Рассылка о встрече <Filter type="checkbox" field="meeting_delivery" submitFilter={this.applyFilter} /></td>
							<td className="green">Дополнительный анонс курса <Filter type="text" field="announcement" submitFilter={this.applyFilter} /></td>
							<td className="green">Люди от ГЛЦ иные условия <Filter type="text" field="other_tos" submitFilter={this.applyFilter} /></td>
							<td className="green">Удостоверения НЛИ выданы / отправлены <Filter type="checkbox" field="nli_doc_delivered" submitFilter={this.applyFilter} /></td>
							<td className="green">Удостоверения ВНИИФК выданы / отправлены <Filter type="checkbox" field="vniifk_doc_delivered" submitFilter={this.applyFilter} /></td>

							<td className="orange">ОПЛАТЫ Вероника <Filter type="checkbox" field="payments1" submitFilter={this.applyFilter} /></td>
							<td className="orange">ОТЧЕТ РЕДАКТОРУ Александра <Filter type="checkbox" field="report" submitFilter={this.applyFilter} /></td>
							<td className="orange">ФОТО С КУРСА Александра <Filter type="checkbox" field="photos" submitFilter={this.applyFilter} /></td>
							<td className="orange">ФИН ОТЧЕТ Дмитрий <Filter type="checkbox" field="fin_report" submitFilter={this.applyFilter} /></td>
							<td className="orange">ПРОТОКОЛЫ Дмитрий <Filter type="checkbox" field="protocols" submitFilter={this.applyFilter} /></td>
							<td className="orange">ВИДЕО Станислав и Анна <Filter type="checkbox" field="videos" submitFilter={this.applyFilter} /></td>
							<td className="orange">ОПЛАТА Ольга <Filter type="checkbox" field="payments2" submitFilter={this.applyFilter} /></td>
						</tr>
						</thead>
						<tbody>
						{this.buildCoachRows()}
						</tbody>
					</table>
				</div>
				</div>
		);
	}
}


class FormRow extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			row: this.props.row
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({row: nextProps.row});
	}


	changeInput = (e) => {
		let newRow = this.state.row;
		newRow[e.name] = e.value;
		this.setState({row: newRow}, () => {
			if(this.props.onChange) this.props.onChange(this.state.row, this.props.index);
			this.forceUpdate();
		});
	}

	render() {

		let row = this.state.row;
		let index = this.props.index;
		let key = 1*index;
		let renderEvent = this.props.renderEvent;
		let renderSport = this.props.renderSport;

		return(
			<tr>
				<td key={"cell-"+key++}>{row.instructorname}</td>
				<td key={"cell-"+key++}> 
					<CustomInput name={"camera_owner"}  onChange={this.changeInput} value={row.camera_owner}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"tos_delivered"}  onChange={this.changeInput} value={row.tos_delivered == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"tos_received"}  onChange={this.changeInput} value={row.tos_received == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomInput name={"manuals_delivered"}  onChange={this.changeInput} value={row.manuals_delivered}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomInput name={"docs_delivered"}  onChange={this.changeInput} value={row.docs_delivered}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomTextarea name={"tickets"} onChange={this.changeInput} value={row.tickets}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomTextarea name={"transfer"} onChange={this.changeInput} value={row.transfer}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomTextarea name={"accomodation"} onChange={this.changeInput} value={row.accomodation}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomTextarea name={"hall"} onChange={this.changeInput} value={row.hall}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomTextarea name={"catering"} onChange={this.changeInput} value={row.catering}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomTextarea name={"skipass"} onChange={this.changeInput} value={row.skipass}/>
				</td>
				<td key={"cell-"+key++}>
					<StatusBox name={"nli_doc_released"} value={row.nli_doc_released == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<StatusBox name={"vniifk_doc_released"} value={row.vniifk_doc_released == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"confirmation"}  onChange={this.changeInput} value={row.confirmation == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					{row.qty}
				</td>
				<td key={"cell-"+key++}>
					{row.retake_qty}
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"meeting_delivery"}  onChange={this.changeInput} value={row.meeting_delivery == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomTextarea name={"announcement"} onChange={this.changeInput} value={row.announcement}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomTextarea name={"other_tos"} onChange={this.changeInput} value={row.other_tos}/>
				</td>
				<td key={"cell-"+key++}>
					<StatusBox name={"nli_doc_delivered"} value={row.nli_doc_delivered == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<StatusBox name={"vniifk_doc_delivered"} value={row.vniifk_doc_delivered == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"payments1"} onChange={this.changeInput} value={row.payments1 == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"report"} onChange={this.changeInput} value={row.report == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"photos"} onChange={this.changeInput} value={row.photos == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"fin_report"} onChange={this.changeInput} value={row.fin_report == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"protocols"} onChange={this.changeInput} value={row.protocols == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"videos"}  onChange={this.changeInput} value={row.videos == "true"}/>
				</td>
				<td key={"cell-"+key++}>
					<CustomCheckbox name={"payments2"}  onChange={this.changeInput} value={row.payments2 == "true"}/>
				</td>
			</tr>
		)
	}
}


class CustomInput extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			value: this.props.value,
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({value: nextProps.value});
	}

	submitChange = () => {
		this.props.onChange({value: this.state.value, name: this.props.name});
	}

	delayedAction = (fun) => {
		let timer = null;
		return () => {
			clearTimeout(timer);
			timer = setTimeout(fun, 1000);
		}
	} 

	delayedSubmit = this.delayedAction(this.submitChange);

	changeValue = (event) => {
		this.setState({
			value: event.target.value,
		}, () => {this.delayedSubmit()});
	}

	render() {

		return (
			<div>
				<input name={this.props.name} disabled={this.props.disabled} value={this.state.value} onChange={this.changeValue}/>
			</div>
		);
	}
}

class CustomCheckbox extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			value: this.props.value,
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({value: nextProps.value});
	}

	submitChange = () => {
		this.props.onChange({value: this.state.value, name: this.props.name});
	}

	changeValue = () => {
		this.setState({
			value: !this.state.value,
		}, () => {this.submitChange()});
	}

	render() {

		return (
			<div>
				<input name={this.props.name} type="checkbox" disabled={this.props.disabled} checked={this.state.value} onChange={this.changeValue}/>
			</div>
		);
	}
}


class CustomTextarea extends React.Component {
	constructor(props){
		super(props);
		this.changeValue = this.changeValue.bind(this);

		this.state = {
			value: this.props.value || "",
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({value: nextProps.value});
	}

	submitChange = () => {
		this.props.onChange({value: this.state.value, name: this.props.name});
	}

	delayedAction = (fun) => {
		let timer = null;
		return () => {
			clearTimeout(timer);
			timer = setTimeout(fun, 2000);
		}
	} 

	delayedSubmit = this.delayedAction(this.submitChange);

	changeValue = (event) => {
		this.setState({
			value: event.target.value,
		}, () => {this.delayedSubmit()});
	}

	render() {

		return (
			<div>
				<textarea name={this.props.name} value={this.state.value} onChange={this.changeValue}/>
			</div>
		);
	}
}

class Filter extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			filter: null,
			currentValue: null,
			changed: false,
		}
	}

	componentWillUnmount() {
		this.nv.removeEventListener("mouseenter", this.handleMouseEnter);
		this.nv.removeEventListener("mouseleave", this.handleMouseOut);
		window.removeEventListener("mousedown", this.pageClick);
	}

	submitFilter = (data) => {
		let changed = data == "default" ? false : true;
		this.setState({currentValue: data, changed: changed});
		this.closeFilter();
		this.props.submitFilter(data, this.props.type, this.props.field);
	}

	renderFilter = () => {
		let filter = this.state.filter;
		let inside;
		if(!filter){
			inside = true;
			if(this.props.type == "text") {
				filter = (
					<div className="schedule-filter">
						<TextFilter submitFilter={this.submitFilter} closeFilter={this.closeFilter}
							 currentValue={this.state.currentValue == "default" ? "" : this.state.currentValue}/>
					</div>
				)
			}
			if(this.props.type == "checkbox") {
				filter = (
					<div className="schedule-filter">
						<CheckboxFilter submitFilter={this.submitFilter} closeFilter={this.closeFilter}
							 currentValue={this.state.currentValue}/>
					</div>
				)
			}
			if(this.props.type == "select") {
				filter = (
					<div className="schedule-filter">
						<SelectFilter submitFilter={this.submitFilter} closeFilter={this.closeFilter}
							currentValue={this.state.currentValue} />
					</div>
				)
			}
			this.nv.addEventListener("mouseenter", this.handleMouseEnter);
			this.nv.addEventListener("mouseleave", this.handleMouseOut);
			window.addEventListener('mousedown', this.pageClick, false);
		} else {
			filter = false;
			inside = false;
			this.closeFilter();
		}
		this.setState({filter: filter, inside: inside});
	}

	resetFilter = () => {
		this.submitFilter("default");
	}

	closeFilter = () => {
		this.nv.removeEventListener("mouseenter", this.handleMouseEnter);
		this.nv.removeEventListener("mouseleave", this.handleMouseOut);
		window.removeEventListener("mousedown", this.pageClick);
		this.setState({filter: null});
	}

	pageClick = (e) => {
		if(!this.state.inside) {
			this.closeFilter();
		}
	}

	handleMouseEnter = () => {
		this.setState({inside: true});
	}

	handleMouseOut = () => {
		this.setState({inside: false});
	}

	render(){
		let buttons = null;
		if(this.props.type != "select") {
			buttons = (
				<div className="filter-button-container">
					<div className={"schedule-filter-btn" + (this.state.changed ? " changed" : "")} onClick={this.renderFilter}></div>
					<div className="schedule-filter-reset-btn" onClick={this.resetFilter}></div>
				</div>
			);
		} else {
			buttons = (
				<div className="filter-button-container">
					<div className={"schedule-select-filter-btn" + (this.state.changed ? " changed" : "")} onClick={this.renderFilter}></div>
				</div>
			);
		}
		return(
			<div ref={elem => this.nv = elem}>
				{buttons}
				<div>
					{this.state.filter}
				</div>
			</div>
		);
	}
}


class TextFilter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: ""
		}
	}

	componentDidMount() {
		if(this.props.currentValue) this.setState({value: this.props.currentValue});
		this.filterInput.focus();
	}

	changeValue = (event) => {
		this.setState({value: event.target.value});
	}

	submitFilter = () => {
		let val = this.state.value == "" ? "default" : this.state.value;
		this.props.submitFilter(val);
	}

	handleKeyPress = (e) => {
		if(e.key == "Enter") {
			this.submitFilter();
		} else if (e.key == "Escape") {
			this.props.closeFilter();
		}
	}

	render() {

		return(
			<div onKeyPress={this.handleKeyPress}>
				<div className="close-filter" onClick={this.props.closeFilter}></div>
				<input ref={(input) => { this.filterInput = input; }} name="textFilter" value={this.state.value}
						 onChange={this.changeValue} />
				<button className="filter-button" onClick={this.submitFilter}>Найти</button>
			</div>
		);
	}
}


class CheckboxFilter extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			selectedValue: "default"
		}
	}

	componentDidMount() {
		if(this.props.currentValue) this.setValue(this.props.currentValue);
	}

	setValue = (value) => {
		this.setState({selectedValue: value});
	}

	changeValue = (event) => {
		this.setState({selectedValue: event.target.value});
	}

	submitFilter = () => {
		this.props.submitFilter(this.state.selectedValue);
	}

	handleKeyPress = (e) => {
		if(e.key == "Enter") {
			this.submitFilter();
		} else if (e.key == "Escape") {
			e.preventDefault();
			this.props.closeFilter();
		}
	}

	render() {

		let selected = this.state.selectedValue;

		return(
			<div onKeyPress={this.handleKeyPress}>
				<div className="close-filter" onClick={this.props.closeFilter}></div>
				<select name="checkboxFilter" onChange={this.changeValue}>
					<option selected={selected == "default"} value="default">Все</option>
					<option selected={selected == "true"} value="true">Есть галочка</option>
					<option selected={selected == "false"} value="false">Нет галочки</option>
				</select>
				
				<button className="filter-button" onClick={this.submitFilter}>Подтвердить</button>
			</div>

		)
	}
}

class SelectFilter extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			selectedValue: "default"
		}
	}

	componentDidMount() {
		if(this.props.currentValue) this.setValue(this.props.currentValue);
	}

	setValue = (value) => {
		this.setState({selectedValue: value});
	}

	changeValue = (event) => {
		this.setState({selectedValue: event.target.value});
	}

	submitFilter = () => {
		this.props.submitFilter(this.state.selectedValue);
	}

	handleKeyPress = (e) => {
		if(e.key == "Enter") {
			this.submitFilter();
		} else if (e.key == "Escape") {
			e.preventDefault();
			this.props.closeFilter();
		}
	}

	render() {

		let selected = this.state.selectedValue;

		return(
			<div onKeyPress={this.handleKeyPress}>
				<div className="close-filter" onClick={this.props.closeFilter}></div>
				<select name="checkboxFilter" onChange={this.changeValue}>
					<option selected={selected == "default"} value="default">Все</option>
					<option selected={selected == "upcoming"} value="upcoming">Предстоящие</option>
					<option selected={selected == "past"} value="past">Прошедшие</option>
				</select>
				
				<button className="filter-button" onClick={this.submitFilter}>Подтвердить</button>
			</div>

		)
	}
}

class StatusBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value,
		}
	}

	render() {
		let boxClass = "box-icon"
		boxClass += this.props.value ? " icon-checked" : " icon-not_checked";
		return(
			<div class={boxClass}>
				
			</div>
		);
	}
}