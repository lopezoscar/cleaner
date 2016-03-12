"use strict";
//Cleaner: Borrar los archivos mas viejos a una fecha
// y los que pesen mas que x cantidad en un carpeta(default carpeta donde estoy parado)


var fs = require("fs");
var async = require("async");
var moment = require("moment");
var args = require('argsparser').parse();

function cleaner(dir,date,size,type){
    fs.readdir(dir,function(err,list){
        if(err){
            console.log("No se puede ver los archivos y carpetas");
        }else{

            async.eachSeries(list,function(item,next){
                var file = dir+"/"+item;
                fs.lstat(file,function(err,stat){
                    if(err){
                        console.log("Err",err);
                    }else{

                        var modifiedTime = new Date(stat.mtime);
                        var dateLimit = moment(date, "YYYYMMDD");

                        if(type){
                            switch (type.toUpperCase()){
                                case "KB":
                                    stat.size = stat.size/1024;
                                    break;
                                case "MB":
                                    stat.size = stat.size/1024/1024;
                                    break;
                                case "GB":
                                    stat.size = stat.size/1024/1024/1024;
                                    break;
                            }
                        }

                        //Si son mas viejos los borro.
                        if(dateLimit > modifiedTime || (!isNaN(size) && stat.size > Number(size))){
                            console.log(file,modifiedTime,stat.size, dateLimit < modifiedTime);

                            fs.unlink(file,function(err){
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log("Borré el archivo ",file);
                                }
                                next();
                            });
                        }else{
                            console.log("No es mas viejo ni tiene el size");
                            next();
                        }
                    }
                });
            },function(){
                console.log("DONE");
            });
        }
    })
}

var size = args['-size'];
var date = args['-date'];
var type = args['-type'];
var dir  = args['-dir'];

var validTypes = ["KB","MB","GB"];

function run(){
    if(typeof dir === "undefined"){
        console.log("Debe colocar una dir");
        return;
    }
    try{
        fs.statSync(dir);
    }catch(err){
        console.log(err);
        console.log("No se puede acceder al directorio");
        return;
    }

    if(type && validTypes.indexOf(type.toUpperCase()) == -1 ){
        console.log("Tipo inválido, solo se permite KB, MB, GB");
        return;
    }
    if(size && isNaN(Number(size)) ){
        console.log("Solo se permiten números.");
        return;
    }
    if(date && new Date(date) == "Invalid Date"){
        console.log("Fecha inválida. Formato YYYYMMDD");
        return;
    }
    cleaner(dir,date,size,type);
}
run();






