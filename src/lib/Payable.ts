export class Account {
    constructor(readonly id: string, public name: string, public url: string) {
    }
}

export class Content {
    constructor(readonly id: string, public title: string, public url: string) {
    }
}

export class Payable {
    readonly id: string;
    
    constructor(readonly site: string, readonly account: Account, readonly content: Content, readonly address: string) {
        this.id = this.site 
                + (this.account ? '/~' + this.account.id : '') 
                + (this.content.id.startsWith('/') ? '' : '/') 
                + this.content.id;
    }
}
