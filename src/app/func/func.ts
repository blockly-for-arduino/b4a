// 比较新旧两个数组
export function compareList(oldList, newList) {
    let resObj: any = {
        add: [],
        del: []
    },
        cenObj = {};
    for (let i = 0; i < oldList.length; i++) {
        cenObj[oldList[i]] = oldList[i];
    }
    for (let j = 0; j < newList.length; j++) {
        if (!cenObj[newList[j]]) {
            resObj.add.push(newList[j]);
        } else {
            delete cenObj[newList[j]]
        }
    }
    for (let k in cenObj) {
        resObj.del.push(k);
    }
    return resObj;
}