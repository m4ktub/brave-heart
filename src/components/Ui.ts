import { UsedContributable, UsageMap, Settings } from "../lib/State";
import { Account } from "../lib/Contributable";

function valuesOf<T>(obj: { [key: string]: T }): T[] {
    return Object.keys(obj).map(k => obj[k]);
}

interface Used {
    seconds: number;
}

function sumSeconds<T extends Used>(objects: T[]): number {
    return objects.reduce((total, used) => total + used.seconds, 0);
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
        let filtered = valuesOf(usage).filter(used => {
            let c = used.contributable;
            
            if (excluded.has(c.site)) {
                return false;
            }

            if (c.account && excluded.has(c.account.url)) {
                return false;
            }

            if (excluded.has(c.content.url)) {
                return false;
            }

            return true;
        });

        // recreate an usage map from the filtered values
        return filtered.reduce((filtered, use) => {
            filtered[use.contributable.id] = use;
            return filtered;
        }, {} as UsageMap);;
    }

    private group(usage: UsageMap) {
        let groupedUsage = valuesOf(usage).reduce((map, used) => {
            let c = used.contributable;
            let key = c.site + (c.account ? "~" + c.account.name : "");
            if (map.has(key)) {
                map.get(key).push(used);
            } else {
                map.set(key, [used]);
            }
            return map;
        }, new Map<string, UsedContributable[]>())

        let producers = Array.from(groupedUsage.values()).map(group => {
            let specimen = group[0].contributable;
            return new UiProducer(specimen.site, specimen.account, group);
        });

        return sortBySecondsDesc(producers);
    }
}

export class UiProducer {
    readonly title: string;
    readonly seconds: number;
    readonly url: string;
    readonly contents: UsedContributable[];

    constructor(readonly site: string, readonly account: Account, contents: UsedContributable[]) {
        if (account) {
            this.title = account.name;
            this.url = account.url;
        } else {
            this.title = site;
            this.url = site;
        }

        this.contents = sortBySecondsDesc(contents);
        this.seconds = sumSeconds(contents);
    }
}