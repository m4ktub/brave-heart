import { Payable, Account, Content } from "./Payable";

export class UsedPayable {
    paid: number;
    seconds: number;
    manual: boolean;
    constructor(readonly payable: Payable) {
        this.paid = 0;
        this.seconds = 0;
        this.manual = false;
    }
}

export interface UsageMap {
    [key: string]: UsedPayable;
}

export class Period {
    readonly start: String;
    readonly usage: UsageMap;
    end?: String;
    paid: boolean;

    constructor() {
        this.start = new Date().toISOString();
        this.end = null;
        this.usage = {};
        this.paid = false;
    }

    close() {
        this.end = new Date().toISOString();
    }

    trackUsage(payable: Payable, seconds: number = 0): UsedPayable {
        let usage = this.usage[payable.id];
        if (! usage) {
            usage = this.usage[payable.id] = new UsedPayable(payable);
        }

        // add usage
        usage.seconds += seconds;

        // update payable mutable details
        usage.payable.content.title = payable.content.title;
        if (usage.payable.account && payable.account) {
            usage.payable.account.name = payable.account.name;
        }

        return usage;
    }

    remove(payable: Payable) {
        delete this.usage[payable.id];
    }
}

export interface Settings {
    currency: string;
    minAmount: number;
    rate: number;
    excludedUrls: string[];
}

interface StorageChanges {
    [key: string]: chrome.storage.StorageChange;
}

export class PersistentState {
    currentPeriod: Period;
    settings: Settings;
    previousPeriods: Period[];
    seed: string;

    constructor(initializer?: (loaded: PersistentState) => void) {
        this.currentPeriod = new Period();
        this.previousPeriods = [];
        this.seed = null;
        this.settings = {
            currency: 'USD',
            minAmount: 0.1,
            rate: 1.0,
            excludedUrls: []
        };

        this.load(initializer);
    }

    protected load(initializer?: (loaded: PersistentState) => void) {
        // get stored state
        chrome.storage.local.get((items: { [key: string]: any }) => {
            // initialize state from stored json
            if (items.state) {
                this.updateFrom(items.state);
            }

            // invoke provided initializer
            if (initializer) {
                initializer(this);
            }

            // monitor changes to update previously loaded state
            chrome.storage.onChanged.addListener((changes: StorageChanges, areaName: string) => {
                this.updateFrom(changes.state.newValue);
            });
        });
    }

    protected updateFrom(json: any) {
        Object.assign(this, json);
        Object.setPrototypeOf(this.currentPeriod, Period.prototype);
        Object.keys(this.currentPeriod.usage).map(k => this.currentPeriod.usage[k]).forEach(tc => {
            Object.setPrototypeOf(tc, UsedPayable.prototype);
            Object.setPrototypeOf(tc.payable, Payable.prototype);
            Object.setPrototypeOf(tc.payable.content, Content.prototype);
            if (tc.payable.account) {
                Object.setPrototypeOf(tc.payable.account, Account.prototype);
            }
        });

        this.settings.rate = this.settings.rate || 1.0;
        this.settings.excludedUrls = this.settings.excludedUrls || [];
    }

    startNewPeriod(): Period {
        this.currentPeriod.close();
        this.previousPeriods.push(this.currentPeriod);
        this.currentPeriod = new Period();
        return this.currentPeriod;
    }

    save(callback?: () => void) {
        chrome.storage.local.set({ state: this }, callback);
    }
}
