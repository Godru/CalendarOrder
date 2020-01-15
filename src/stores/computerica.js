// import { observable, computed } from 'mobx';
import { EffiProtocol, serializeAURL, serializeAURLAsync, prepareDataList } from '../lib/effi_protocol';


class LocalDictionary {
	effi = new EffiProtocol()
	lang = null;
	volumes = {};
	dict = {};

	constructor(effi, load_success) {
		if (effi) this.effi = effi;
		this.refresh(load_success);
	}

	get(str) {
		const res = this.dict[str];
		// console.log(`dict[${str}] = ${res}`);
		return res || str;
	}

	refresh(success) {
		const post_data = (this.lang ? `lang=s:${this.lang}` : '');
		this.effi.request({
			url: '/nologin/srv/Computerica/AuthForms/DictionaryGet',
			data: post_data,
			success: (data) => {
				this.dict = data;
				if (success) success(data);
			}
		});
	}
}

class ComputericaStore {
	effi = new EffiProtocol();
	dictionary = null;

	constructor(opts) {
		if (opts.effi) this.effi = opts.effi;
		this.dictionary = new LocalDictionary(this.effi, opts.dictLoaded);
	}

	loadCountryCodes(success) {
		this.effi.request({
			url: '/nologin/srv/Computerica/Country/CountryListGet_API',
			success: success,
			error: console.error
		});
	}

	loadAccrGroups(sport_eventid, success) {
		let data = (sport_eventid ? `sport_eventid=i:${sport_eventid}&` : '');
		this.effi.request({
			url: '/nologin/srv/Computerica/AccrGroup/AccrGroupListGet_API',
			data: data,
			success: success,
			error: console.error
		});
	}

	loadWorkPositions(success) {
		this.effi.request({
			url: '/nologin/srv/Computerica/WorkPosition/WorkPositionListGet_API',
			success: success,
			error: console.error
		});
	}

	loadUpcomingEvents(success) {
		this.effi.request({
			url: '/srv/Computerica/SportEvent/OrgAccessibleSportEventListGet',
			success: (data) => {
				success(prepareDataList(data).data);
			},
			error: console.error
		});
	}

	loadCurrentProfiles(success) {
		this.effi.request({
			url: '/srv/Computerica/Person/OrgPersonListGet',
			success: (data) => {
				success(prepareDataList(data).data);
			},
			error: console.error
		});
	}

	loadSportEventCustomizableFields(sport_eventid, success) {
		this.effi.request({
			url: '/nologin/srv/Computerica/SportEventCustomizableField/GetValue',
			data: `sport_eventid=i:${sport_eventid}&`,
			success: success,
			error: console.error
		});
	}
}



export default ComputericaStore;
