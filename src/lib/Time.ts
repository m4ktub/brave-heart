import * as moment from "moment";
import { Translator } from './I18n';

type Formatable = Date | string | number;

export class TimeFormatter {
    readonly i18n: Translator;

    constructor(i18n: Translator) {
        this.i18n = i18n;
    }

    private format(d: Formatable) {
        const defaultFormat = "LL";
        return moment(d).locale(this.i18n.language).format(defaultFormat);
    }

    duration(seconds: number): string {
        const time = Date.now() - seconds * 1000;
        return moment(time).locale(this.i18n.language).fromNow(true);
    }

    range(start: Formatable, end?: Formatable) {
        if (end) {
            return this.i18n.translate("date_from_to", [this.format(start), this.format(end)]);
        } else {
            return this.i18n.translate("date_since", [this.format(start)]);
        }
    }
}
