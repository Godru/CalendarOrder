import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import Formsy from 'formsy-react';
import { HOC } from 'formsy-react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { IconButton, RaisedButton, FlatButton, Paper, MenuItem, Divider, Dialog, AutoComplete} from 'material-ui';
import { FormsyCheckbox, FormsyDate, FormsyRadio, FormsyRadioGroup, 
				 FormsySelect, FormsyText, FormsyTime, FormsyToggle, FormsyAutoComplete } from 'formsy-material-ui/lib';
import SuperSelectField from 'material-ui-superselectfield/lib/SuperSelectField';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ContentClear from 'material-ui/svg-icons/content/clear';
import { EffiProtocol, serializeAURL, serializeAURLAsync } from './lib/effi_protocol';
import './styles/register-form.less';

import { DateTimeFormat } from 'intl';
import 'intl/locale-data/jsonp/ru-RU';
import 'intl/locale-data/jsonp/en-GB';

let effi = new EffiProtocol();
injectTapEventPlugin();


const ruCalendar = {
			ruDateFormat: DateTimeFormat('ru', {
				day: 'numeric',
				month: 'numeric',
				year: 'numeric',
			}).format,
			locale: 'ru-RU',
			cancelLabel: 'Отмена',
		};

const enCalendar = {
			ruDateFormat: DateTimeFormat('en', {
				day: 'numeric',
				month: 'numeric',
				year: 'numeric',
			}).format,
			locale: 'en-GB',
			cancelLabel: 'Cancel',
		};

const I18N = {
				'ru': {
					header: 'Форма регистрации',
					calendar: ruCalendar,
					userInfo: {
						title: 'Личные данные',
						last_name: {
							caption: 'Фамилия',
							err: 'Неверная Фамилия',
						},
						first_name: {
							caption: 'Имя',
							err: 'Неверное Имя'
						},
						middle_name: {
							caption: 'Отчество',
							err: 'Неверное Отчество',
						},
						first_name_latin: {
							caption: 'Имя латинскими буквами',
						},
						last_name_latin: {
							caption: 'Фамилия латинскими буквами',
						},
						gender: {
							caption: 'Укажите пол',
							options: ['Мужской', 'Женский'],

						},
						phone1: {
							caption: 'Телефон',
							err: 'Неверный телефонный номер'
						},
						phone2: {
							caption: 'Телефон 2',
						},
						email: {
							caption: 'Адрес эл. почты',
							err: 'Неверный email',
						},
						birthdate: {
							caption: 'Дата рождения',
						},
						birth_countrycode: {
							caption: 'Страна рождения',
						},
						birth_place: {
							caption: 'Страна',
						},
						sitizenshipcode: {
							caption: 'Код гражданина',
						},
						accr_group: {
							caption: 'Категория аккредитации',
						},
					},

					passwords: {
						title: 'Регистрация в личном кабинете',
						warning: 'Внимание! Адрес Вашей электронной почты автоматически становиться Вашим логином в личном кабинете.',
						password: {
							caption: 'Введите пароль'
						},
						password2: {
							caption: 'Повторите пароль',
							err: 'Пароли не совпадают',
						},
					},
					organizationInfo: {
						title: 'Организация',
						org_name: {
							caption: 'Название организации'
						},
						mass_media_name: {
							caption: 'Название СМИ'
						},
						mass_media_type: {
							caption: 'Тип СМИ'
						},
						mass_media_country: {
							caption: 'Страна СМИ'
						},
						org_work_position: {
							caption: 'Должность'
						},
						org_phone: {
							caption: 'Телефон'
						},
						org_email: {
							caption: 'Адрес эл. почты',
							err: 'Неверный email',
						},
						org_fax: {
							caption: 'Факс'
						},
					},
					passportInfo: {
						title: 'Пасспортные данные',
						pass_series: {
							caption: 'Серия'
						},
						pass_number: {
							caption: 'Номер'
						},
						pass_doc_type: {
							caption: 'Тип документа'
						},
						pass_issued_by: {
							caption: 'Кем выдан'
						},
						pass_dept_code: {
							caption: 'Код подразделения'
						},
						pass_issued_at: {
							caption: 'Дата выдачи'
						},
						pass_expires_at: {
							caption: 'Дата истечения'
						}
					},
					actualAddress: {
						title: 'Адрес проживания',
						actual_postal_index: {
							caption: 'Почтовый индекс'
						},
						actual_countrycode: {
							caption: 'Код страны',
							err: 'Неверный код страны',
						},
						actual_region: {
							caption: 'Регион'
						},
						actual_district: {
							caption: 'Район'
						},
						actual_city: {
							caption: 'Город'
						},
						actual_street: {
							caption: 'Улица'
						},
						actual_house: {
							caption: 'Дом'
						},
						actual_housing: {
							caption: 'Корпус'
						},
						actual_building: {
							caption: 'Строение'
						},
						actual_apartment: {
							caption: 'Квартира'
						}
					},
					regAddress: {
						title: 'Адрес по прописке',
						reg_postal_index: {
							caption: 'Почтовый индекс'
						},
						reg_countrycode: {
							caption: 'Код страны',
							err: 'Неверный код страны'
						},
						reg_region: {
							caption: 'Регион'
						},
						reg_district: {
							caption: 'Район'
						},
						reg_city: {
							caption: 'Город'
						},
						reg_street: {
							caption: 'Улица'
						},
						reg_house: {
							caption: 'Дом'
						},
						reg_housing: {
							caption: 'Корпус'
						},
						reg_building: {
							caption: 'Строение'
						},
						reg_apartment: {
							caption: 'Квартира'
						}
					},

					photos: {
						title: 'Фото',
						photo: {
							caption: 'Загрузить фотографию',
						},
						pass1_scan_file: {
							caption: 'Фото первой страницы паспорта'
						},
						pass2_scan_file: {
							caption: 'Фото второй страницы паспорта'
						}
					},

					comments: {
						accomodation_comments: {
							caption: 'Комментарии по размещению'
						}
					},
					checkboxes: {
						agreed: {
							caption: 'Я даю согласие на обработку моих персональных данных'
						}
					},
					submit: {
						caption: 'Зарегистрироваться'
					},
					errors: {
						registerError: 'Ошибка при регистрации',
						systemError: 'Системная ошибка при регистрации'
					},
					dialog: {
						close: 'Закрыть',
					},
					success: {
						caption: 'Благодарим за регистрацию!',
						message: 'Ваша заявка успешно отправлена. В ближайшее время вы получите письмо с подтверждением регистрации.'
					}
				},
				'en': {
					header: 'Registration form',
					calendar: enCalendar,
					userInfo: {
						title: 'Personal data',
						last_name: {
							caption: 'Last name',
							err: 'Invalid last name',
						},
						first_name: {
							caption: 'First name',
							err: 'Invalid first name'
						},
						middle_name: {
							caption: 'Middle name',
							err: 'Invalid middle name',
						},
						first_name_latin: {
							caption: 'First name in latin letters',
						},
						last_name_latin: {
							caption: 'Last name in latin letters',
						},
						gender: {
							caption: 'Select gender',
							options: ['Male', 'Female'],
						},
						phone1: {
							caption: 'Phone number',
							err: 'Invalid phone number'
						},
						phone2: {
							caption: 'Extra phone number',
						},
						email: {
							caption: 'Email address',
							err: 'Invalid email',
						},
						birthdate: {
							caption: 'Birth date',
						},
						birth_countrycode: {
							caption: 'Birth country',
						},
						birth_place: {
							caption: 'Country',
						},
						sitizenshipcode: {
							caption: 'Sitizenship code',
						},
						accr_group: {
							caption: 'Accreditation group',
						},
					},

					passwords: {
						title: 'Account registration',
						warning: 'Attention! Your email address will automatically become you\'r account name.',
						password: {
							caption: 'Input password'
						},
						password2: {
							caption: 'Repeat password',
							err: 'Passwords do not match',
						},
					},
					organizationInfo: {
						title: 'Organization',
						org_name: {
							caption: 'Organization name'
						},
						mass_media_name: {
							caption: 'Mass media name'
						},
						mass_media_type: {
							caption: 'Mass media type'
						},
						mass_media_country: {
							caption: 'Mass media country'
						},
						org_work_position: {
							caption: 'Organization work position'
						},
						org_phone: {
							caption: 'Phone number'
						},
						org_email: {
							caption: 'Email address',
							err: 'Invalid email',
						},
						org_fax: {
							caption: 'Fax'
						},
					},
					passportInfo: {
						title: 'Passport data',
						pass_series: {
							caption: 'Series'
						},
						pass_number: {
							caption: 'Number'
						},
						pass_doc_type: {
							caption: 'Passport type'
						},
						pass_issued_by: {
							caption: 'Issued by'
						},
						pass_dept_code: {
							caption: 'Department code'
						},
						pass_issued_at: {
							caption: 'Issued at'
						},
						pass_expires_at: {
							caption: 'Expires at'
						}
					},
					actualAddress: {
						title: 'Actual address',
						actual_postal_index: {
							caption: 'Postal index'
						},
						actual_countrycode: {
							caption: 'Country code',
							err: 'Invalid Country code',
						},
						actual_region: {
							caption: 'Region'
						},
						actual_district: {
							caption: 'District'
						},
						actual_city: {
							caption: 'City'
						},
						actual_street: {
							caption: 'Street'
						},
						actual_house: {
							caption: 'House'
						},
						actual_housing: {
							caption: 'Housing'
						},
						actual_building: {
							caption: 'Building'
						},
						actual_apartment: {
							caption: 'Apartment'
						}
					},
					regAddress: {
						title: 'Registration address',
						reg_postal_index: {
							caption: 'Postal index'
						},
						reg_countrycode: {
							caption: 'Country code',
							err: 'Invalid county code'
						},
						reg_region: {
							caption: 'Region'
						},
						reg_district: {
							caption: 'District'
						},
						reg_city: {
							caption: 'City'
						},
						reg_street: {
							caption: 'Street'
						},
						reg_house: {
							caption: 'House'
						},
						reg_housing: {
							caption: 'Housing'
						},
						reg_building: {
							caption: 'Building'
						},
						reg_apartment: {
							caption: 'Apartment'
						}
					},

					photos: {
						title: 'Photo',
						photo: {
							caption: 'Upload photo',
						},
						pass1_scan_file: {
							caption: 'Passport first page scan'
						},
						pass2_scan_file: {
							caption: 'Passport second page scan'
						}
					},

					comments: {
						accomodation_comments: {
							caption: 'Accomodation comments'
						}
					},
					checkboxes: {
						agreed: {
							caption: 'I agree with personal data processing agreement'
						}
					},
					submit: {
						caption: 'Sign Up'
					},
					errors: {
						registerError: 'Registration error',
						systemError: 'System error during registration',
					},
					dialog: {
						close: 'close',
					},
					success: {
						caption: 'Thank you for registering!',
						message: 'Thank you, your request for registration has been sent, you will receive an email confirming your request shortly.'
					}
				}
			}


window.RenderRegisterForm = function(htmlid, opts) {
	const baseurl = opts.baseurl || "";
	effi = new EffiProtocol(baseurl);
	ReactDOM.render(
		<RegisterForm 
			host={baseurl} 
			title={opts.title} 
			formid={opts.formid}
			sport_eventid={opts.sport_eventid} 
			wf_ruleid={opts.wf_ruleid} 
			fields={opts.fields}
			theme={opts.theme}
			language={opts.language}
			sitekey={opts.captcha_sitekey}
			agreement_text={opts.agreement_text} />, 
		document.getElementById(htmlid));
}


class RegisterForm extends React.Component {
	constructor(props) {
		super(props);
		this.mapInputs = this.mapInputs.bind(this);
		this.enableButton = this.enableButton.bind(this);
		this.disableButton = this.disableButton.bind(this);
		this.handleReg = this.handleReg.bind(this);
		this.successReg = this.successReg.bind(this);
		this.failureReg = this.failureReg.bind(this);
		this.openDialog = this.openDialog.bind(this);
		this.onCloseDialog = this.onCloseDialog.bind(this);
		this.getCountryCodes = this.getCountryCodes.bind(this);
		this.getAccreditations = this.getAccreditations.bind(this);
		this.getWorkPositions = this.getWorkPositions.bind(this);
		this.toggleLanguage = this.toggleLanguage.bind(this);

		this.state = {
			canSubmit: false,
			sport_eventid: this.props.sport_eventid,
			wf_ruleid: this.props.wf_ruleid,
			fields: this.props.fields,
			dialogOpen: false,
			formVisible: true,
			successVisible: false,
			countries: [],
			accreditations: [],
			work_positions: [],
			mass_media_types: [
				{id: 'tv',             name: 'ТВ канал',                name_en: 'TV channel'},
				{id: 'radio',          name: 'Радио',                   name_en: 'Radio'},
				{id: 'inform_agency',  name: 'Информационное агенство', name_en: 'News agency'},
				{id: 'printed',        name: 'Печатное издание',        name_en: 'Newspaper/Magazine'},
				{id: 'internet',       name: 'Интернет-издание',        name_en: 'Internet'}
			],
			
			lang: this.props.language,
			sitekey: this.props.sitekey,
			
		}
	}


	mapInputs(inputs) {

		return {
			first_name: inputs.first_name || null,
			last_name: inputs.last_name || null,
			middle_name: inputs.middle_name || null,
			first_name_latin: inputs.first_name_latin || null,
			last_name_latin: inputs.last_name_latin || null,
			password: inputs.password || null,
			password2: inputs.password2 || null,
			gender: inputs.gender || null,
			accr_groupid: inputs.accr_group || null, 
			phone1: inputs.phone1 || null,
			phone2: inputs.phone2 || null,
			email: inputs.email || null,
			birthdate: inputs.birthdate == null ? null : new Date(inputs.birthdate),
			birth_countrycode: inputs.birth_countrycode || null,
			birth_place: inputs.birth_place || null,
			sitizenshipcode: inputs.sitizenshipcode || null,
			agreed: inputs.agreed ? "TRUE" : "FALSE",
			foreigner: (inputs.foreigner ? "TRUE" : "FALSE") || null,
			room_type: null,
			accomodation_comments: inputs.accomodation_comments || null,
			additional_data: null,
			photofile: inputs.photo || null,
			pass1_scan_file: inputs.pass1_scan_file || null,
			pass2_scan_file: inputs.pass2_scan_file || null,
			val_passport: {
				doc_type: inputs.pass_doc_type || null,
				series: inputs.pass_series || null,
				number: inputs.pass_number || null,
				issued_by: inputs.pass_issued_by || null,
				issued_at: inputs.pass_issued_at == null ? null : new Date(inputs.pass_issued_at),
				dept_code: inputs.pass_dept_code || null,
				expires_at: inputs.pass_expires_at == null ? null : new Date(inputs.pass_expires_at),
			},
			val_actual_address: {
				postal_index: inputs.actual_postal_index || null,
				countrycode: inputs.actual_countrycode || null,
				region: inputs.actual_region || null,
				district: inputs.actual_district || null,
				city: inputs.actual_city || null,
				street: inputs.actual_street || null,
				house: inputs.actual_house || null,
				housing: inputs.actual_housing || null,
				building: inputs.actual_building || null,
				apartment: inputs.actual_apartment || null,
			},
			val_reg_address: {
				postal_index: inputs.reg_postal_index || null,
				countrycode: inputs.reg_countrycode || null,
				region: inputs.reg_region || null,
				district: inputs.reg_district || null,
				city: inputs.reg_city || null,
				street: inputs.reg_street || null,
				house: inputs.reg_house || null,
				housing: inputs.reg_housing || null,
				building: inputs.reg_building || null,
				apartment: inputs.reg_apartment || null,
			},
			val_visa_support: null,
			val_organization: {
				name: inputs.org_name || null,
				mass_media_name: inputs.mass_media_name || null,
				mass_media_type: inputs.mass_media_type || null,
				mass_media_country: inputs.mass_media_country,
				work_position: inputs.org_work_position || null,
				phone: inputs.org_phone || null,
				email: inputs.org_email || null,
				fax: inputs.org_fax || null,
			},
			val_arrival: null,
			val_departure: null,
		};
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

	formatData(data) {
		let result = {};
		for (let key in data) {
			// console.log(key + " = " + data[key] + " : " + typeof(data[key]));
			if (data[key] == null || typeof data[key] == 'undefined') continue;
			switch (typeof(data[key])) {
				case "int":
					result[key] = { value: data[key], type: "number" };
				break;
				case 'float':
					result[key] = { value: data[key], type: "float" };
				break;
				case 'string':
					if ((key == 'name') || (key == 'work_position')) {
						result[key] = { value: data[key], type: "string" };
					} else {
						result[key] = { value: data[key], type: "string" };
					}
				break;
				case 'object':
					if (data[key] instanceof Date) {
						result[key] = { value: data[key], type: "ADate" };
					} else if (data[key] instanceof File) {
						result[key] = { value: data[key], type: 'BlobFile' };
					} else {
						let o = this.formatData(data[key]),
							keys = [];
						for (let k in o) keys.push(k);
						if (keys.length == 0) continue;
						result[key] = { value: o, type: 'Structure' };
					}
					
				break;
				default: 
					result[key] = { value: data[key], type: typeof(data[key])};
				break;
			}
		}

		return result;
	}

	handleReg(model) {
		const me = this;
		let data = this.formatData(model);
		// console.log(data);
		serializeAURLAsync(data, function (serialized) {
			if (me.state.sport_eventid) serialized += `sport_eventid=i:${me.state.sport_eventid}&`;
			if (me.state.wf_ruleid) serialized += `wf_ruleid=i:${me.state.wf_ruleid}&`;
			if (me.state.lang) serialized += `lang=s:${me.state.lang}&`;
			effi.request({
				url: '/nologin/srv/Computerica/Person/Register_API',
				data: serialized,
				success: me.successReg,
				error: me.failureReg,
			});
		});

	}

	successReg(res) {
		this.setState({
			formVisible: false,
			successVisible: true
		})
	}

	failureReg(res) {
		if (res && res.ExceptionText) this.openDialog(res.ExceptionText);
		else this.openDialog(I18N[this.state.lang].errors.systemError);
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

	getCountryCodes() {
		let me = this;
		effi.request({
			url: '/nologin/srv/Computerica/Country/CountryListGet_API',
			success: (res) => {
				me.setState({
					countries: res,
				});
			},
			error: (error) => {
				console.log(error);
			},
		});
	}

	getAccreditations() {
		let data = (this.props.sport_eventid ? `sport_eventid=i:${this.props.sport_eventid}&` : '');
		effi.request({
			url: '/nologin/srv/Computerica/AccrGroup/AccrGroupListGet_API',
			data: data,
			success: (res) => {
				this.setState({
					accreditations: res,
				});
			},
			error: (error) => {
				console.log(error);
			},
		});
	}

	getWorkPositions() {
		let me = this;
		effi.request({
			url: '/nologin/srv/Computerica/WorkPosition/WorkPositionListGet_API',
			success: (data) => {
				me.setState({
					work_positions: data
				})
			},
			error: (error) => {
				console.log(error);
			},
		});
	}

	toggleLanguage(e) {
		if (e) e.preventDefault();
		this.setState({
			lang: (this.state.lang == 'ru' ? 'en' : 'ru')
		})
	}


	componentDidMount() {
		this.getCountryCodes();
		this.getAccreditations();
		this.getWorkPositions();

		if (this.state.fields.indexOf('captcha')) {
			var htmlid = 'google-recaptcha-script';
			// var el = document.getElementById(htmlid);
			// if (el) document.head.removeChild(el);
			const gRecaptcha = document.createElement("script");
			gRecaptcha.src = "https://www.google.com/recaptcha/api.js?hl=" + this.state.lang;
			gRecaptcha.async = true;
			gRecaptcha.defer = true;
			gRecaptcha.id = htmlid;
			document.head.appendChild(gRecaptcha);
		}

	}


	render() {

		let autocompleteStyle = {
			marginRight: '40px',
		}

		let sections = {
			userInfo: [],
			passwords: [],
			organizationInfo: [],
			photos: [],
			passportInfo: [],
			actualAddress: [],
			regAddress: [],
			comments: [],
			checkboxes: [],
			captcha: []
		};
		let i = 0;

		let workPositionsConfig = {
			text: (this.state.lang == 'ru' ? 'name' : 'name_en'),
			value: 'id',
		}
		let l = this.state.lang;

		let countries = [];
		for (let j in this.state.countries) {
			let n = ((this.state.lang != 'ru' && this.state.countries[j].name_en) ? this.state.countries[j].name_en : this.state.countries[j].name);
			countries.push(<div key={i++} label={n} value={this.state.countries[j].code}>{n}</div>);
		}
		let mediaTypes = [];
		for (let j in this.state.mass_media_types) {
			let n = (this.state.lang == 'ru' ? this.state.mass_media_types[j].name : this.state.mass_media_types[j].name_en);
			mediaTypes.push(<div key={i++} label={n} value={this.state.mass_media_types[j].id}>{n}</div>);
		}

		for (let field of this.state.fields) {
			switch(field) {
				case 'last_name':
					sections.userInfo.push(<FormsyText key={i++} className="text-field" name="last_name" floatingLabelText={I18N[l].userInfo.last_name.caption + "*"} required validations="isExisty" validationError={I18N[l].userInfo.last_name.err}/>);
				break;
				case 'first_name': 
					sections.userInfo.push(<FormsyText key={i++} className="text-field" name="first_name" floatingLabelText={I18N[l].userInfo.first_name.caption + "*"} required validations="isExisty" validationError={I18N[l].userInfo.first_name.err}/>);
				break;
				case 'middle_name':
					sections.userInfo.push(<FormsyText key={i++} className="text-field" name="middle_name" floatingLabelText={I18N[l].userInfo.middle_name.caption}/>);
				break;
				case 'first_name_latin':
					sections.userInfo.push(<FormsyText key={i++} className="text-field" name="first_name_latin" floatingLabelText={I18N[l].userInfo.first_name_latin.caption}/>);
				break;
				case 'last_name_latin':
					sections.userInfo.push(<FormsyText key={i++} className="text-field" name="last_name_latin" floatingLabelText={I18N[l].userInfo.last_name_latin.caption}/>);
				break;
				case 'gender':
					sections.userInfo.push(
						<FormsySelect key={i++} className="select-field" value="male" name="gender" floatingLabelText={I18N[l].userInfo.gender.caption}>
							<MenuItem value="male" primaryText={I18N[l].userInfo.gender.options[0]}/>
							<MenuItem value="female" primaryText={I18N[l].userInfo.gender.options[1]} />
						</FormsySelect>
					);
				break;
				case 'phone1':
					sections.userInfo.push(<FormsyText key={i++} className="text-field" name="phone1" floatingLabelText={I18N[l].userInfo.phone1.caption + "*"} required validations="isExisty" validationError={I18N[l].userInfo.phone1.err} />);
				break;
				case 'phone2':
					sections.userInfo.push(<FormsyText key={i++} className="text-field" name="phone2" floatingLabelText={I18N[l].userInfo.phone2.caption}/>);
				break;
				case 'email':
					sections.userInfo.push(<FormsyText key={i++} className="text-field" name="email" floatingLabelText={I18N[l].userInfo.email.caption + "*"} required validations="isExisty" validationError={I18N[l].userInfo.email.err}/>);
				break;
				case 'birthdate':
					sections.userInfo.push(<FormsyDate key={i++} className="date-field" name="birthdate" hintText={I18N[l].userInfo.birthdate.caption} container="inline"
																	locale={I18N[l].calendar.locale} formatDate={I18N[l].calendar.ruDateFormat} DateTimeFormat={DateTimeFormat} cancelLabel={I18N[l].calendar.cancelLabel}/>);
				break;
				case 'birth_countrycode':
					sections.userInfo.push(<FormSuperSelect key={i++} className="super-select"  hint={I18N[l].userInfo.birth_countrycode.caption}
																	hintTextAutocomplete={I18N[l].selectInputHint} name="birth_countrycode" opts={countries}/>);
				break;
				case 'birth_place':
					sections.userInfo.push(<FormsyText key={i++} className="text-field" name="birth_place" floatingLabelText={I18N[l].userInfo.birth_place.caption}/>);
				break;
				case 'sitizenshipcode':
					sections.userInfo.push(<FormsyText key={i++} className="text-field" name="sitizenshipcode" floatingLabelText={I18N[l].userInfo.sitizenshipcode.caption}/>);
				break;
				case 'accr_group':
					let groups = [];
					let j = 0;
					if (this.state.accreditations && this.state.accreditations.length > 0) {
						for (let group of this.state.accreditations) {
							let name = group.name;
							if (this.state.lang != 'ru' && group.name_en) name = group.name_en;
							groups.push(<MenuItem key={j++} value={group.id} primaryText={name} />);
						}
						sections.organizationInfo.push(
							<FormsySelect key={i++} className="select-field" value={this.state.accreditations[0].id} name="accr_group" floatingLabelText={I18N[l].userInfo.accr_group.caption + '*'} required>
								{groups}
							</FormsySelect>
						);
					}
				break;
				case 'additional_data':
				break;
				case 'password':
					sections.passwords.push(<FormsyText key={i++} className="text-field" name="password" floatingLabelText={I18N[l].passwords.password.caption + "*"} type="password" required/>);
				break;
				case 'password2':
					sections.passwords.push(<FormsyText key={i++} className="text-field" name="password2" floatingLabelText={I18N[l].passwords.password2.caption + "*"} type="password" validations="equalsField:password" validationError={I18N[l].passwords.password2.err} required/>);
				break;

				case 'org_name':
					sections.organizationInfo.push(<FormsyText key={i++} className="text-field" name="org_name" floatingLabelText={I18N[l].organizationInfo.org_name.caption + "*"} required />);
				break;
				case 'mass_media_name':
					sections.organizationInfo.push(<FormsyText key={i++} className="text-field" name="mass_media_name" floatingLabelText={I18N[l].organizationInfo.mass_media_name.caption + "*"} required/>);
				break;
				case 'mass_media_type':
					sections.organizationInfo.push(<FormSuperSelect key={i++} className="super-select"  hint={I18N[l].organizationInfo.mass_media_type.caption + "*"}
																	name="mass_media_type" opts={mediaTypes} required/>);
				break;
				case 'mass_media_country':
					sections.organizationInfo.push(<FormSuperSelect key={i++} className="super-select"  hint={I18N[l].organizationInfo.mass_media_country.caption + "*"}
																	hintTextAutocomplete={I18N[l].selectInputHint} name="mass_media_country" opts={countries} required/>);
				break;
				case 'org_work_position':
					sections.organizationInfo.push(<FormSuperSelect key={i++} className="super-select"  hint={I18N[l].organizationInfo.org_work_position.caption}
																	name="org_work_position" opts={mediaTypes}/>);
				break;
				case 'org_phone':
					sections.organizationInfo.push(<FormsyText key={i++} className="text-field" name="org_phone" floatingLabelText={I18N[l].organizationInfo.org_phone.caption}/>);
				break;
				case 'org_email':
					sections.organizationInfo.push(<FormsyText key={i++} className="text-field" name="org_email" validations="isEmail" validationError={I18N[l].organizationInfo.org_email.err} floatingLabelText={I18N[l].organizationInfo.org_email.caption}/>);
				break;
				case 'org_fax':
					sections.organizationInfo.push(<FormsyText key={i++} className="text-field" name="org_fax" floatingLabelText={I18N[l].organizationInfo.org_fax.caption}/>);
				break;
				case 'photo':
					sections.photos.push(<InputFile key={i++} className="upload-field" labelText={I18N[l].photos.photo.caption} btnClass="file-btn" inputClass="file-input" name="photo"/>);
				break;
				case 'pass1_scan_file':
					sections.photos.push(<InputFile key={i++} className="upload-field" labelText={I18N[l].photos.pass1_scan_file.caption} btnClass="file-btn" inputClass="file-input" name="pass1_scan_file"/>);
				break;
				case 'pass2_scan_file':
					sections.photos.push(<InputFile key={i++} className="upload-field" labelText={I18N[l].photos.pass2_scan_file.caption} btnClass="file-btn" inputClass="file-input" name="pass2_scan_file"/>);
				break;
				case 'pass_series':
					sections.passportInfo.push(<FormsyText key={i++} className="text-field" name="pass_series" floatingLabelText={I18N[l].passportInfo.pass_series.caption}/>);
				break;
				case 'pass_number':
					sections.passportInfo.push(<FormsyText key={i++} className="text-field" name="pass_number" floatingLabelText={I18N[l].passportInfo.pass_number.caption}/>);
				break;
				case 'pass_doc_type':
					sections.passportInfo.push(<FormsyText key={i++} className="text-field" name="pass_doc_type" floatingLabelText={I18N[l].passportInfo.pass_doc_type.caption}/>);
				break;
				case 'pass_issued_by':
					sections.passportInfo.push(<FormsyText key={i++} className="text-area"  name="pass_issued_by" floatingLabelText={I18N[l].passportInfo.pass_issued_by.caption} />);
				break;
				case 'pass_dept_code':
					sections.passportInfo.push(<FormsyText key={i++} className="text-field" name="pass_dept_code" floatingLabelText={I18N[l].passportInfo.pass_dept_code.caption}/>);
				break;
				case 'pass_issued_at':
					sections.passportInfo.push(<FormsyDate key={i++} className="date-field" name="pass_issued_at" hintText={I18N[l].passportInfo.pass_issued_at.caption} container="inline"
																			locale={I18N[l].calendar.locale} formatDate={I18N[l].calendar.dateFormat} DateTimeFormat={DateTimeFormat}
																			cancelLabel={I18N[l].calendar.cancelLabel}/>);
				break;
				case 'pass_expires_at':
					sections.passportInfo.push(<FormsyDate key={i++} className="date-field" name="pass_expires_at" hintText={I18N[l].passportInfo.pass_expires_at.caption} container="inline"
																		locale={I18N[l].calendar.locale} formatDate={I18N[l].calendar.dateFormat} DateTimeFormat={DateTimeFormat}
																		cancelLabel={I18N[l].calendar.cancelLabel}/>);
				break;
				case 'actual_postal_index':
					sections.actualAddress.push(<FormsyText key={i++} className="text-field" name="actual_postal_index" floatingLabelText={I18N[l].actualAddress.actual_postal_index.caption} />);
				break;
				case 'actual_countrycode':
					sections.actualAddress.push(<FormSuperSelect key={i++} className="super-select"  hint={I18N[l].actualAddress.actual_countrycode.caption}
																	hintTextAutocomplete={I18N[l].selectInputHint} name="actual_countrycode" opts={countries}/>);
				break;
				case 'actual_region':
					sections.actualAddress.push(<FormsyText key={i++} className="text-field" name="actual_region" floatingLabelText={I18N[l].actualAddress.actual_region.caption} />);
				break;
				case 'actual_district':
					sections.actualAddress.push(<FormsyText key={i++} className="text-field" name="actual_district" floatingLabelText={I18N[l].actualAddress.actual_district.caption} />);
				break;
				case 'actual_city':
					sections.actualAddress.push(<FormsyText key={i++} className="text-field" name="actual_city" floatingLabelText={I18N[l].actualAddress.actual_city.caption} />);
				break;
				case 'actual_street':
					sections.actualAddress.push(<FormsyText key={i++} className="text-field" name="actual_street" floatingLabelText={I18N[l].actualAddress.actual_street.caption} />);
				break;
				case 'actual_house':
					sections.actualAddress.push(<FormsyText key={i++} className="text-field" name="actual_house" floatingLabelText={I18N[l].actualAddress.actual_house.caption} />);
				break;
				case 'actual_housing':
					sections.actualAddress.push(<FormsyText key={i++} className="text-field" name="actual_housing" floatingLabelText={I18N[l].actualAddress.actual_housing.caption} />);
				break;
				case 'actual_building':
					sections.actualAddress.push(<FormsyText key={i++} className="text-field" name="actual_building" floatingLabelText={I18N[l].actualAddress.actual_building.caption} />);
				break;
				case 'actual_apartment':
					sections.actualAddress.push(<FormsyText key={i++} className="text-field" name="actual_apartment" floatingLabelText={I18N[l].actualAddress.actual_apartment.caption} />);
				break;

				case 'reg_postal_index':
					sections.regAddress.push(<FormsyText key={i++} className="text-field" name="reg_postal_index" floatingLabelText={I18N[l].regAddress.reg_postal_index.caption} />);
				break;
				case 'reg_countrycode':
					sections.regAddress.push(<FormSuperSelect key={i++} className="super-select" hint={I18N[l].regAddress.reg_countrycode.caption}
																	hintTextAutocomplete={I18N[l].selectInputHint} name="reg_countrycode" opts={countries}/>);
				break;
				case 'reg_region':
					sections.regAddress.push(<FormsyText key={i++} className="text-field" name="reg_region" floatingLabelText={I18N[l].regAddress.reg_region.caption} />);
				break;
				case 'reg_district':
					sections.regAddress.push(<FormsyText key={i++} className="text-field" name="reg_district" floatingLabelText={I18N[l].regAddress.reg_district.caption} />);
				break;
				case 'reg_city':
					sections.regAddress.push(<FormsyText key={i++} className="text-field" name="reg_city" floatingLabelText={I18N[l].regAddress.reg_city.caption} />);
				break;
				case 'reg_street':
					sections.regAddress.push(<FormsyText key={i++} className="text-field" name="reg_street" floatingLabelText={I18N[l].regAddress.reg_street.caption} />);
				break;
				case 'reg_house':
					sections.regAddress.push(<FormsyText key={i++} className="text-field" name="reg_house" floatingLabelText={I18N[l].regAddress.reg_house.caption} />);
				break;
				case 'reg_housing':
					sections.regAddress.push(<FormsyText key={i++} className="text-field" name="reg_housing" floatingLabelText={I18N[l].regAddress.reg_housing.caption} />);
				break;
				case 'reg_building':
					sections.regAddress.push(<FormsyText key={i++} className="text-field" name="reg_building" floatingLabelText={I18N[l].regAddress.reg_building.caption} />);
				break;
				case 'reg_apartment':
					sections.regAddress.push(<FormsyText key={i++} className="text-field" name="reg_apartment" floatingLabelText={I18N[l].regAddress.reg_apartment.caption} />);
				break;

				case 'val_visa_support':

				break;
				case 'val_arrival':

				break;
				case 'val_departure':

				break;
				case 'accomodation_comments':
					sections.comments.push(<FormsyText key={i++} className="text-area" name="accomodation_comments" value="" multiLine={true} rows={2} floatingLabelText={I18N[l].comments.accomodation_comments.caption}/>);
				break;
				case 'foreigner':

				break;
				case 'room_type':

				break;
				case 'agreed':
					if (this.props.agreement_text && this.props.agreement_text[this.state.lang]) {
						sections.checkboxes.push(<div className="agreement_text" dangerouslySetInnerHTML={{ __html: this.props.agreement_text[this.state.lang] }}></div>);
					}
					sections.checkboxes.push(<FormsyCheckbox key={i++} className="checkbox_agree" name="agreed" label={I18N[l].checkboxes.agreed.caption} validations="isExisty"  required="isFalse"/>);
				break;
				case 'captcha':
					sections.captcha.push(<Captcha name="captcha" key={i++} sitekey={this.state.sitekey} required />);
				break;
			}
		}

		let addDividers = function(sections) {
			for (let key in sections) {
				if (sections[key].length > 0) sections[key].push(<Divider key={i++} className="divider"/>);
			}
		}

		addDividers(sections);
		if (sections.userInfo.length > 0) sections.userInfo.unshift(<h2 key={i++}>{I18N[l].userInfo.title}</h2>);
		if (sections.passwords.length > 0) {
			sections.passwords.unshift(<h5 className="pass_note" key={i++}>{I18N[l].passwords.warning}</h5>)
			sections.passwords.unshift(<h2 key={i++}>{I18N[l].passwords.title}</h2>);
		}
		if (sections.organizationInfo.length > 0) sections.organizationInfo.unshift(<h2 key={i++}>{I18N[l].organizationInfo.title}</h2>);
		if (sections.passportInfo.length > 0) sections.passportInfo.unshift(<h2 key={i++}>{I18N[l].passportInfo.title}</h2>);
		if (sections.actualAddress.length > 0) sections.actualAddress.unshift(<h2 key={i++}>{I18N[l].actualAddress.title}</h2>);
		if (sections.regAddress.length > 0) sections.regAddress.unshift(<h2 key={i++}>{I18N[l].regAddress.title}</h2>);
		if (sections.photos.length > 0) sections.photos.unshift(<h2 key={i++}>{I18N[l].photos.title}</h2>);

		const dialogActions = [<FlatButton label={I18N[l].dialog.close} onTouchTap={this.onCloseDialog} />];

		let formDisplay = (this.state.formVisible ? {} : {display: 'none'}),
			successDisplay = (this.state.successVisible ? {} : {display: 'none'});
		let to_language = (this.state.lang == 'ru' ? 'Switch to English' : 'Переключиться на русский язык'),
			language_link = `/register/${this.props.formid}/` + (this.state.lang == 'ru' ? 'en' : 'ru');


		return(
			<div className="register-container">
			<MuiThemeProvider muiTheme={getMuiTheme(this.props.theme)}>
				<Paper zDepth={3} className="paper-container">
					{/*
					<IconButton className="close-button" >
						<ContentClear/>
					</IconButton>
					*/}
					<Formsy.Form ref="registerForm" onInvalid={this.disableButton} mapping={this.mapInputs} onValid={this.enableButton} onSubmit={this.handleReg} style={formDisplay}>
						<div className="fields-container">
							<div className="language-chooser">
								<a href={language_link}>{to_language}</a>
							</div>
							<h1 className="form-title">{this.props.title}</h1>
							<div>
								{sections.userInfo}
							</div>
							<div>
								{sections.passwords}
							</div>
							<div>
								{sections.organizationInfo}
							</div>
							<div>
								{sections.passportInfo}
							</div>
							<div>
								{sections.actualAddress}
							</div>
							<div>
								{sections.regAddress}
							</div>
							<div>
								{sections.photos}
							</div>
							<div>
								{sections.comments}
							</div>
							<div>
								{sections.checkboxes}
							</div>
							<div>
								{sections.captcha}
							</div>
						</div>
						<div className="submit-container">
							<RaisedButton className="register-button" primary label={I18N[l].submit.caption} type="submit" disabled={!this.state.canSubmit} />
						</div>
					</Formsy.Form>
					<Dialog title={I18N[l].errors.registerError} actions={dialogActions} modal={false} open={this.state.dialogOpen} onRequestClose={this.onCloseDialog}>
						{this.state.dialogContent}
					</Dialog>
					<div className="fields-container" style={successDisplay}>
						<h2>{I18N[l].success.caption}</h2>
						<p>{I18N[l].success.message}</p>
					</div>
				</Paper>
			</MuiThemeProvider>
			</div>

		);
	}
}


@HOC
class InputFile extends React.Component {
	constructor(props){
		super(props);
		this.changeValue = this.changeValue.bind(this);

		this.state = {
			value: this.props.getValue() || "",
		}
	}

	changeValue(event) {
		this.setState({
			value: event.target.value,
		});
		this.props.setValue(event.target.files[0]);
	}

	render() {

		let pathStyle = {
			display: 'inline',
		}
		let filename = this.state.value.split("\\").pop();

		return (
			<div>
				<RaisedButton label={this.props.labelText} labelPosition="before" className={this.props.btnClass} containerElement="label">
					<input type="file" name={this.props.name} value={this.state.value} onChange={this.changeValue} className={this.props.inputClass} />
				</RaisedButton>
				<h4 style={pathStyle}>{filename}</h4>
			</div>
		);
	}
}

@HOC
class Captcha extends React.Component {
	constructor(props) {
		super(props);

		this.captchaCallback = this.captchaCallback.bind(this);
	}

	captchaCallback() {
		this.props.setValue(true);
	}

	render() {

		window.captchaCallback = this.captchaCallback;
		return (
			<div class="g-recaptcha" data-sitekey={this.props.sitekey} data-callback="captchaCallback"></div>
		)
	}
}

@HOC
class FormSuperSelect extends React.Component {
	constructor(props) {
		super(props);

		this.handleSelection = this.handleSelection.bind(this);

		this.state = {
			[this.props.name]: null,
		}
	}

	handleSelection(value, name) {
		this.setState({[name]: value});
		this.props.setValue(value.value);
	}

	render() {
		return(
			<div className="super-select">
				<SuperSelectField style={this.props.style} hintText={this.props.hint} hintTextAutocomplete={this.props.hintTextAutocomplete}
													onChange={this.handleSelection} name={this.props.name} value={this.state[this.props.name]}>
					{this.props.opts}
				</SuperSelectField>
			</div>
		);
	}
}
