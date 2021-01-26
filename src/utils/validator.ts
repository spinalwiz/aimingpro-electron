// tslint:disable: forin

/**
 * Compares two objects by its Keys and Types (NOT VALUES!)
 * @param a Object A
 * @param b Object B
 */
const deepCompareObjects = <T>(a: T, b: T): boolean => {
    // Don't even look a this ugly piece of art
    for (const aKey in a) {
        let aInb = false;
        for (const bKey in b) {
            let bIna = false;
            // In this case it's okay to shadow a variable
            // tslint:disable-next-line: no-shadowed-variable
            for (const aKey in a)
                if (bKey === aKey && typeof b[bKey] === typeof a[aKey])
                    bIna = true;
            if (!bIna) return false;
            if (aKey === bKey && typeof a[aKey] === typeof b[bKey]) {
                if (
                    typeof a[aKey] === "object" &&
                    !deepCompareObjects(a[aKey], b[bKey])
                )
                    return false;
                aInb = true;
            }
        }
        if (!aInb) return false;
    }
    return true;
};

/**
 * Fixed an object by comparing the reference to a source by type (needs improvements)
 * @param ref Reference Object
 * @param src Source to be fixed
 */
const fixDatabase = <T>(ref: T, src: T): T  => {
    for (const aKey in ref) {
        for (const bKey in src) {
            // TODO: add another loop over A which adds missing fields
            if (aKey === bKey) {
                if (typeof ref[aKey] !== typeof src[bKey])
                    src[bKey] = ref[aKey];
                if (typeof ref[aKey] === "object") {
                    src[bKey] = fixDatabase(ref[aKey], src[bKey]);
                }
            }
        }
    }
    return src;
};

export const validator = { deepCompareObjects, fixDatabase };
