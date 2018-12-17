
export default function Hello<T>(clazz: new () => T): any {
    let instance;
    const handler = {
        construct: function (target, args) {
            if (!instance) {
                instance = new clazz();
            }
            return instance;
        }
    };
    return new Proxy(clazz, handler);
}
