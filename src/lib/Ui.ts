import { UsedPayable, UsageMap, Settings } from "./State";
import { Account } from "./Payable";
import { Currency } from './Currency';

interface Used {
    seconds: number;
    paid: number;
    manual: boolean;
}

function sum<T>(objects: T[], f: (o: T) => number): number {
    return objects.reduce((total, o) => total + f(o), 0);
}

function sumSeconds(objects: Used[]) {
    return sum(objects, o => o.seconds);
}

function sumPaid(objects: Used[]) {
    return Currency.currency(sum(objects, o => o.paid));
}

function sortBySecondsDesc<T extends Used>(objects: T[]): T[] {
    return objects.sort((a, b) => b.seconds - a.seconds);
}

export class UiUsage {
    readonly seconds: number;
    readonly producers: UiProducer[];

    constructor(usage: UsageMap, settings: Settings) {
        let filteredUsage = this.filter(usage, settings);
        this.producers = this.group(filteredUsage);
        this.seconds = sumSeconds(this.producers);
    }

    private filter(usage: UsageMap, settings: Settings) {
        // get excluded urls, these match sites, accounts, and contents
        let excluded = new Set(settings.excludedUrls);

        // filter conributables matching excluded urls
        let filtered = Object.values(usage).filter(used => {
            let p = used.payable;

            if (excluded.has(p.site)) {
                return false;
            }

            if (p.account && excluded.has(p.account.url)) {
                return false;
            }

            if (excluded.has(p.content.url)) {
                return false;
            }

            return true;
        });

        // recreate an usage map from the filtered values
        return filtered.reduce((filtered, use) => {
            filtered[use.payable.id] = use;
            return filtered;
        }, {} as UsageMap);;
    }

    private group(usage: UsageMap) {
        let groupedUsage = Object.values(usage).reduce((map, used) => {
            let c = used.payable;
            let key = c.site + (c.account ? "~" + c.account.name : "");
            if (map.has(key)) {
                map.get(key).push(used);
            } else {
                map.set(key, [used]);
            }
            return map;
        }, new Map<string, UsedPayable[]>())

        let producers = Array.from(groupedUsage.values()).map(group => {
            let specimen = group[0].payable;
            return new UiProducer(specimen.site, specimen.account, group);
        });

        return sortBySecondsDesc(producers);
    }
}

export class UiProducer {
    readonly title: string;
    readonly seconds: number;
    readonly url: string;
    readonly contents: UsedPayable[];
    private _paid: number;
    private _manual: boolean;

    constructor(readonly site: string, readonly account: Account, contents: UsedPayable[]) {
        this.contents = sortBySecondsDesc(contents);
        this.seconds = sumSeconds(contents);
        this._paid = sumPaid(contents);
        this._manual = contents.every(c => c.manual);

        if (this.contents.length == 1) {
            let c = this.contents[0].payable;
            this.title =  c.account ? c.account.name : c.content.title;
            this.url = c.content.url;
        } else {
            this.title = account ? account.name : site;
            this.url = account ? account.url : site;
        }
    }

    get paid(): number {
        return this._paid;
    }

    set paid(value: number) {
        // save total paid value
        this._paid = Currency.currency(value);

        // propagate paid value to contents, proportionally
        this.contents.forEach(content => {
            content.paid = Currency.proportion(value, content.seconds, this.seconds);
        });

        // adjust first content due to rounding errors
        this.contents[0].paid += this._paid - sumPaid(this.contents);
    }

    get manual(): boolean {
        return this._manual;
    }

    set manual(value: boolean) {
        this._manual = value;
        this.contents.forEach(content => {
            content.manual = value;
        });
    }

}
