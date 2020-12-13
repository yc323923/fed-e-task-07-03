#!/usr/bin/env node

//脚手架的工作过程

//1.通过命令行交互询问用户问题
const fs = require("fs")
const path = require("path");
const inquirer = require("inquirer");
const ejs = require("ejs")
inquirer.prompt([
    {
        type:"input",
        name:"name",
        message:"YOUR PROJECT NAME"
    }
]).then(answer=>{
    //2.通过用户的回答来生成文件
    const temDir = path.join(__dirname,"templates")
    //目标目录
    const desDir = process.cwd()
    //将模板文件全部换到目标目录
    fs.readdir(temDir,(err,files)=>{
        files.forEach(file=>{
            //通过模板引擎渲染文件
            ejs.renderFile(path.join(temDir,file),answer,(err,result)=>{
                console.log(desDir)
                fs.writeFileSync(path.join(desDir,file),result)
            })
        })
    })
})