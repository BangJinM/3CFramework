export class StringUtils {
    static HaveString(original: string, check: string): boolean {
        let begin = original.indexOf(check)
        if (begin >= 0)
            return true
        return false
    }

    static SubString(original: string, subString: string) {
        let begin = original.indexOf(subString)
        if (begin < 0)
            return original
        let str = ""
        if (begin > 0)
            str = original.substring(0, begin)
        if (begin + subString.length < original.length - 1) {
            str = str + original.substring(begin + subString.length, original.length - 1)
        }
        return str
    }

    static AddStringToFirst(original: string, addString: string) {
        if (this.HaveString(original, addString))
            return original
        return addString + original
    }

    static AddStringToEnd(original: string, addString: string) {
        if (this.HaveString(original, addString))
            return original
        return original + addString
    }
}