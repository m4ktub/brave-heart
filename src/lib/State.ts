import { Contributable } from "./Contributable";

class UsedContributable {
    constructor(readonly contributable: Contributable, public seconds: number = 0) {
    }
}

export interface UsageMap {
    [key: string]: UsedContributable;
}

export class Period {
    readonly start: Date;
    readonly end: Date;
    readonly usage: UsageMap;
    
    constructor() {
        const now = new Date();
        
        this.start = new Date(now.getFullYear(), now.getMonth(), 1);
        this.end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59 );
        this.usage = {};
    }
    
    addUsage(contributable: Contributable, seconds: number = 0) {
        let usage = this.usage[contributable.id];
        if (! usage) {
            usage = this.usage[contributable.id] = new UsedContributable(contributable);
        }
        
        usage.seconds += seconds;
        return usage;
    }
    
    remove(contributable: Contributable) {
        delete this.usage[contributable.id];
    }
}

export interface Settings {
    currency: string;
    minAmount: number;
}

interface StorageChanges { 
    [key: string]: chrome.storage.StorageChange;
}

export class PersistentState {
    currentPeriod: Period;
    settings: Settings;

    constructor() {
        this.currentPeriod = new Period();
        this.settings = {
            currency: 'USD',
            minAmount: 0.1
        };
        
        this.load();
    }
    
    protected load() {
        // get stored state
        chrome.storage.local.get((items: { [key: string]: any }) => {
            // initialize state from stored json
            if (items.state) {
                this.updateFrom(items.state);
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
            Object.setPrototypeOf(tc, UsedContributable.prototype);
        });
    }
    
    save(callback?: () => void) {
        chrome.storage.local.set({ state: this }, callback);
    }
}
