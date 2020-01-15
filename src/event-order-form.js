import React from 'react';
import ReactDOM from 'react-dom';
import Formsy from 'formsy-react';
import { HOC } from 'formsy-react';
// import { observer } from 'mobx-react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { IconButton, RaisedButton, FloatingActionButton, FlatButton, Paper, MenuItem, Divider, Dialog, AutoComplete} from 'material-ui';
import { FormsyCheckbox, FormsyDate, FormsyRadio, FormsyRadioGroup, 
				 FormsySelect, FormsyText, FormsyTime, FormsyToggle, FormsyAutoComplete } from 'formsy-material-ui/lib';
import SuperSelectField from 'material-ui-superselectfield/lib/SuperSelectField';
import { Input } from 'formsy-react-components'
import injectTapEventPlugin from 'react-tap-event-plugin';
import ContentClear from 'material-ui/svg-icons/content/clear';
import ContentRemove from 'material-ui/svg-icons/content/remove';
import { EffiProtocol, serializeAURL, serializeAURLAsync } from './lib/effi_protocol';
import ComputericaStore from './stores/computerica.js'
import './styles/register-form.less';

let effi = new EffiProtocol();
let computericaStore = null;
injectTapEventPlugin();


window.RenderEventOrderForm = function(htmlid, opts) {
	const baseurl = opts.baseurl || "";
	effi = new EffiProtocol(baseurl);
	ReactDOM.render(
		<EventOrderForm 
			host={baseurl} 
			theme={opts.theme}/>, 
		document.getElementById(htmlid));
}

function M(key) {
	return computericaStore.dictionary.get(key);
}

class EventOrderForm extends React.Component {
	key = 0;
	empty_profile = () => {
		return {key: this.key++, profileid: null, groupid: null, fields: []};
	}

	constructor(props) {
		super(props);
		this.enableButton = this.enableButton.bind(this);
		this.disableButton = this.disableButton.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.openDialog = this.openDialog.bind(this);
		this.onCloseDialog = this.onCloseDialog.bind(this);
		this.toggleLanguage = this.toggleLanguage.bind(this);
		this.eventProvided = this.eventProvided.bind(this);
		this.eventValid = this.eventValid.bind(this);

		this.state = {
			canSubmit: false,
			dialogOpen: false,
			formVisible: true,
			successVisible: false,
			mass_media_types: [
				{id: 'tv',             name: 'ТВ канал',                name_en: 'TV channel'},
				{id: 'radio',          name: 'Радио',                   name_en: 'Radio'},
				{id: 'inform_agency',  name: 'Информационное агенство', name_en: 'Information agency'},
				{id: 'printed',        name: 'Печатное издание',        name_en: 'Newspaper/Magazine'},
				{id: 'internet',       name: 'Интернет-издание',        name_en: 'Internet'}
			],
			lang: 'ru_RU',
			eventProvided: null,
			events: [],
			accr_groups: [],
			available_profiles: [],
			selected_profiles: [this.empty_profile()],
			custom_fields: []
		}

		computericaStore = new ComputericaStore({
			effi: effi,
			dictLoaded: (data) => {
				this.setState({lang: data.LANG});
			}
		});
	}

	componentDidMount() {
		computericaStore.loadUpcomingEvents((data) => {
			this.setState({events: data}, function() {
				const ev = this.eventProvided('id');
				this.setState({eventProvided: ev});
			});
		});
		computericaStore.loadAccrGroups(null, (data) => {
			this.setState({accr_groups: data});
		});
		computericaStore.loadCurrentProfiles((data) => {
			this.setState({available_profiles: data});
		});
	}

	enableButton() {
		this.setState({
			canSubmit: true
		});
	}

	disableButton() {
		this.setState({
			canSubmit: false
		});
	}

	eventValid(id){
		let events = this.state.events;
		for(let i in events){
			if(events[i].id == id) return true;
		}
		return false;
	}

	eventProvided(param){
		const url = window.location.href;
		const regex = new RegExp("(OrgSportEventFolder)[?&].*" + param + "(=[a-zA-Z]:([^&#]*)|&|#|$)");
        let results = regex.exec(url);
        if (!(results && results[3])) return null;
        const id = parseInt(decodeURIComponent(results[3].replace(/\+/g, " ")));
        if (this.eventValid(id)) return id
		return null
	}

	onSubmit(model) {
		const me = this;
		serializeAURLAsync(model, function (serialized) {
			effi.request({
				url: '/srv/Computerica/EventOrder/OrgAddMulti',
				data: serialized,
				success: (data) => {
					me.setState({
						formVisible: false,
						successVisible: true
					});
				},
				error: (res) => {
					if (res && res.ExceptionText) me.openDialog(res.ExceptionText);
					else me.openDialog(I18N[me.state.lang].errors.systemError);
				}
			});
		});
	}

	openDialog(msg) {
		this.setState({
			dialogOpen: true,
			dialogContent: msg || this.state.msg
		});
	}

	onCloseDialog() {
		this.setState({dialogOpen: false});
	}

	toggleLanguage(e) {
		if (e) e.preventDefault();
		this.setState({
			lang: (this.state.lang == 'ru' ? 'en' : 'ru')
		})
	}

	onChangeEvent = (e, value) => {
		let me = this;
		computericaStore.loadSportEventCustomizableFields(value, (data) => {
			me.setState({custom_fields: data || []});
		})
	}
	addProfile = (profile) => {
		let profiles = this.state.selected_profiles;
		profiles.push(this.empty_profile());
		this.setState({selected_profiles: profiles});
	}
	removeProfile = (index) => {
		let profiles = this.state.selected_profiles;
		if (profiles.length > index) {
			profiles.splice(index, 1);
		}
		this.setState({selected_profiles: profiles});
	}

	render() {
		const formDisplay = (this.state.formVisible ? {} : {display: 'none'}),
			successDisplay = (this.state.successVisible ? {} : {display: 'none'}),
			sportEventStyle = {width: '350px'};
		const dialogActions = [<FlatButton label={M("Close")} onTouchTap={this.onCloseDialog} />];
		return (
			<div className="event-order-container">
				<MuiThemeProvider muiTheme={getMuiTheme(this.props.theme)}>
				<div>
					<Formsy.Form ref="eventOrderForm" onInvalid={this.disableButton} onValid={this.enableButton} onValidSubmit={this.onSubmit} style={formDisplay}>
						<div className="fields-container">
							{/*<h3>{M("Apply for accreditation")}</h3>*/}
							<div>
								<FormsySelect className="select-field sport-event-select-field" floatingLabelText={M("Sport Event") + '*'} style={sportEventStyle}
												name="sport_eventid" value={this.state.eventProvided} required onChange={this.onChangeEvent}>
									{this.state.events.map((item, i) => {
										let event_name = item.name;
										if ((this.state.lang != 'ru_RU' && this.state.lang != 'ru') && item.name_en) event_name = item.name_en;
										return <MenuItem key={i} value={item.id} primaryText={event_name}/>
									})}
								</FormsySelect>
							</div>
							<div>
								<FormsyText className="text-field" name="comment" floatingLabelText={M("Comments for organizers")} multiLine={true} />
							</div>

							<h3>{M("Profiles")}</h3>
							{this.state.selected_profiles.map((item, i) => {

								return <ProfileFields key={item.key} index={i} keyindex={item.key}
														profiles={this.state.available_profiles} 
														accr_groups={this.state.accr_groups} 
														custom_fields={this.state.custom_fields}
														onRemove={this.removeProfile} lang={this.state.lang} />
							})}
							<RaisedButton className="add-profile" label={M("Add Profile")} onClick={this.addProfile} />
						</div>

						<div className="submit-container">
							<br/>
							<RaisedButton className="register-button" primary label={M("Apply for accreditation")} type="submit" disabled={!this.state.canSubmit} />
						</div>
						<br/>
					</Formsy.Form>
					<Dialog title={M("Cannot place order. ")} actions={dialogActions} modal={false} open={this.state.dialogOpen} onRequestClose={this.onCloseDialog}>
						{this.state.dialogContent}
					</Dialog>
					<div className="fields-container" style={successDisplay}>
						<h2>{M("Event order placed. ")}</h2>
						<p>{M("You successfully applied for accreditation. We will closely handle your application and send you results. ")}</p>
					</div>
				</div>
				</MuiThemeProvider>
			</div>
		);
	}

}

class ProfileFields extends React.Component {
	constructor(props) {
		super(props);
		this.onProfileChange = this.onProfileChange.bind(this);
		this.onGroupChange = this.onGroupChange.bind(this);
		this.findGroupByName = this.findGroupByName.bind(this);

		this.state = {
			profile: null,
			group: null
		}
	}

	findGroupByName = (id) => {
		const profiles = this.props.profiles;
		const groups = this.props.accr_groups;
		let res = null;
		let groupName = '';
		for (let profile of profiles) {
			if (profile.id == id){
				groupName = profile.accrgroupname;
				break;
			}
		}
		if (groupName) {
			for (let group of groups) {
				if (group.name == groupName) {
					res = group.id;
					break;
				}
			}
		}
		return res;
	}

	onProfileChange = (value, name) => {
		const groupid = this.findGroupByName(name);
		this.setState({profile: name, group: groupid});
	}
	onGroupChange = (value, name) => {
		this.setState({group: value});
	}

	render() {
		const superselect_style = {
			color: 'rgba(0, 0, 0, 0.298039)',
			height: '72px'
		};
		return (
			<div className="event-order-profile-container">
				<div className="fields-line">
					{/*
					<div className="super-select">	
					<SuperSelectField style={superselect_style} className="super-select" 
									hintText={M("Select Profile")} hintTextAutocomplete="la-la-la" 
									onChange={this.onProfileChange} 
									name={`profile[${this.props.index}]`} required
									floatingLabelText={M("Profile")}>
						{this.props.profiles.map((profile, i) => {
							return <div key={i} label={profile.fullname} value={profile.id}>{profile.fullname}</div>
						})}
					</SuperSelectField>
					</div>
					*/}
					<FormsySelect className="select-field"  hintText={M("Select Profile")} floatingLabelText={M("Profile") + '*'}
									name={`persons[${this.props.index}].personid`} value={this.state.profile} onChange={this.onProfileChange} required>
						{this.props.profiles.map((profile, i) => {
							return <MenuItem key={i} value={profile.id} primaryText={profile.fullname}/>
						})}
					</FormsySelect>
					<FormsySelect className="select-field" floatingLabelText={M("Accreditation Group") + '*'} 
									name={`persons[${this.props.index}].groupid`} value={this.state.group} required>
						{this.props.accr_groups.map((item, i) => {
							let group_name = item.name;
							if ((this.props.lang != 'ru_RU' && this.props.lang != 'ru') && item.name_en) group_name = item.name_en;
							return <MenuItem key={item.id} value={item.id} primaryText={group_name}/>
						})}
					</FormsySelect>
					<RaisedButton className="remove-profile" 
								label={M("Delete")} icon={<ContentClear />}
								onClick={(e) => {this.props.onRemove(this.props.index)}} >
					</RaisedButton>
				</div>
				<div className="fields-line">
					{this.props.custom_fields.map((item, i) => {
						let field_label = item.name;
						if ((this.props.lang != 'ru_RU' && this.props.lang != 'ru') && item.name_en) field_label = item.name_en;
						return (
							<div className="custom-field" key={`persons[${this.props.keyindex}][additional_data][${item.id}]`}>
								<Input type="hidden" name={`persons[${this.props.index}][additional_data][${i}].customizable_fieldid`} value={item.id} />
								<FormsyText className="text-field" floatingLabelText={field_label} 
											name={`persons[${this.props.index}][additional_data][${i}].content`} required={item.is_required == "true"} />
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}
