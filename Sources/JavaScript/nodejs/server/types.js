var exceptions = require('./exceptions')
var util = require('util');

var WoopsaObject = function WoopsaObject(name){
    this._properties = [];
    this._methods = [];
    this._items = [];
    this._name = name;
    this._container = null;
}

WoopsaObject.prototype = {
    getContainer: function (){
        return this._container;
    },
    setContainer: function (value){
        this._container = value;
    },
    getProperties: function (){
        return this._properties;
    },
    getMethods: function (){
        return this._methods;
    },
    getItems: function (){
        return this._items;
    },
    getName: function (){
        return this._name;
    },
    addProperty: function (name, type, readOnly){
        if ( !hasElement(this._properties, name) ){
            var newProperty = new WoopsaProperty(name, type, readOnly);
            this._properties.push(newProperty);
            if ( typeof newProperty.setContainer !== 'undefined' )
                newProperty.setContainer(this);
            return newProperty;
        }else{
            throw new exceptions.WoopsaException("Tried to add a property with duplicate name " + name);
        }
    },
    addMethod: function (name, returnType, method){
        if ( !hasElement(this._methods, name) ){
            var newMethod = new WoopsaMethod(name, returnType, method);
            this._methods.push(newMethod);
            if ( typeof newMethod.setContainer !== 'undefined' )
                newMethod.setContainer(this);
            return newMethod;
        }else{
            throw new exceptions.WoopsaException("Tried to add a method with duplicate name " + name);
        }
    },
    addItem: function (item){
        if ( !hasElement(this._items, item.getName()) ){
            this._items.push(item);
            if ( typeof item.setContainer !== 'undefined' )
                item.setContainer(this);
            return item;
        }else{
            throw new exceptions.WoopsaException("Tried to add an item with duplicate name " + item.getName());
        }
    }
}

function hasElement(list, elementname){
    for ( var i in list )
        if ( list[i].getName() === elementname )
            return true;
    return false;
}

var WoopsaProperty = function WoopsaProperty(name, type, read, write){
    this._name = name;
    this._type = type;
    this.read = read;
    if ( typeof write !== 'undefined' ){
        this.write = write;     
    }
    this._container = null;
}

WoopsaProperty.prototype = {
    getContainer: function (){
        return this._container;
    },
    setContainer: function (value){
        this._container = value;
    },
    getName: function (){
        return this._name;
    },
    getType: function (){
        return this._type;
    }
}

var WoopsaMethod = function WoopsaMethod(name, returnType, method, argumentInfos){
    this._name = name;
    this._returnType = returnType;
    this._argumentInfos = [];
    this._method = method;
    if ( typeof argumentInfos !== 'undefined' ){
        for ( var i in argumentInfos ){
            var argInfo = argumentInfos[i];
            for ( var k in argInfo ){
                this.addMethodArgumentInfo(k, argInfo[k]);
                break;
            }
        }
    }
    this._container = null;
}

WoopsaMethod.prototype = {
    getContainer: function (){
        return this._container;
    },
    setContainer: function (value){
        this._container = value;
    },
    getArgumentInfos: function (){
        return this._argumentInfos;
    },
    getName: function (){
        return this._name;
    },
    getReturnType: function (){
        return this._returnType;
    },
    addMethodArgumentInfo: function (name, type){
        if ( !hasElement(this._arguments, name) ){
            var newArgument = new WoopsaMethodArgumentInfo(name, type);
            this._argumentInfos.push(newArgument);
            return newArgument;
        }else{
            throw new exceptions.WoopsaException("Tried to add a method argument with duplicate name " + name + " in method " + this._name);
        }
    },
    invoke: function (arguments){
        return this._method.apply(this, arguments);
    }
}

var WoopsaMethodAsync = function WoopsaMethodAsync(name, returnType, method, argumentInfos){
    WoopsaMethodAsync.super_.call(this, name, returnType, method, argumentInfos);
}

util.inherits(WoopsaMethodAsync, WoopsaMethod);

WoopsaMethodAsync.prototype.invokeAsync = function (arguments, done){
    return this._method.apply(this, arguments.concat([done]));
};
WoopsaMethodAsync.prototype.invoke = function(arguments) {
    throw new exceptions.WoopsaException("Tried to synchronously call an asynchronous WoopsaMethod " + this._name);
};

var WoopsaMethodArgumentInfo = function WoopsaMethodArgumentInfo(name, type){
    this._name = name;
    this._type = type;
}

WoopsaMethodArgumentInfo.prototype = {
    getName: function (){
        return this._name;
    },
    getType: function (){
        return this._type;
    }
}

exports.WoopsaObject = WoopsaObject;
exports.WoopsaProperty = WoopsaProperty;
exports.WoopsaMethod = WoopsaMethod;
exports.WoopsaMethodAsync = WoopsaMethodAsync;
exports.WoopsaMethodArgumentInfo = WoopsaMethodArgumentInfo;