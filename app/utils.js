/**
 * make it possible to access Object nested properties by a 'keyChain' string
 * usage ex: Object.byString(someObj, 'prop1.prop2.prop3');
 based on:
 http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
 */
Object.setByString = function (o, s, v) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    var cur = o;
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in cur && cur[k]) {
            cur = cur[k];
        } else {
            if (i == n - 1) {
                if (typeof v != 'undefined') {
                    cur[k] = v;
                }
            }else{
                cur[k] = {};
                cur = cur[k];
            }
        }
    }
    return cur;
};

Object.getByString = function (o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o && o[k]) {
            o = o[k];
        } else {
            return null;
        }
    }
    return o;
};
