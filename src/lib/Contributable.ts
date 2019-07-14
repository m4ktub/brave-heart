export class Account {
    constructor(readonly id: string, readonly name: string, readonly url: string) {
    }
}

export class Content {
    constructor(readonly id: string, readonly title: string, readonly url: string) {
    }
}

export class Contributable {
    readonly id: string;
    
    constructor(readonly site: string, readonly account: Account, readonly content: Content, readonly address: string) {
        this.id = this.site 
                + (this.account ? '/~' + this.account.id : '') 
                + (this.content.id.startsWith('/') ? '' : '/') 
                + this.content.id;
    }
}
