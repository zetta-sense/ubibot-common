export enum UbiRuleCriteriaKey {
    EQ = "==",
    GE = ">=",
    GT = ">",
    LT = "<",
    LE = "<=",
    NE = "!=",
}

export class UbiRuleCriteria {
    key: UbiRuleCriteriaKey;
    label: string;

    constructor(key: UbiRuleCriteriaKey, label: string) {
        this.key = key;
        this.label = label;
    }
}