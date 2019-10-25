import * as moment from 'moment';

type Formatable = Date | string | number;

export class TimeFormatter {
    readonly locale: string;

    constructor(locale = 'en-US') {
        this.locale = locale;
    }

    private format(d: Formatable) {
        const defaultFormat = "LL";
        return moment(d).locale(this.locale).format(defaultFormat);
    }
 
    duration(seconds: number): string {
        const time = Date.now() - seconds * 1000;
        return moment(time).fromNow(true);
    }

    range(start: Formatable, end?: Formatable) {
        if (end) {
            return "From " + this.format(start) + " to " + this.format(end);
        } else {
            return "Since " + this.format(start);
        }
    }
}
