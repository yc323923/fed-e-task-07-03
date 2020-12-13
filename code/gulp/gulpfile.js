// 实现这个项目的构建任务
const {src ,dest,series,parallel,watch} = require("gulp");
const del = require("del");
const sass = require("gulp-sass");
const babel = require("gulp-babel");
const swig = require("gulp-swig");

const browserSync = require("browser-sync");
const loadPlugins = require("gulp-load-plugins")
const plugin = loadPlugins();
const data = {
    menus: [
      {
        name: 'Home',
        icon: 'aperture',
        link: 'index.html'
      },
      {
        name: 'Features',
        link: 'features.html'
      },
      {
        name: 'About',
        link: 'about.html'
      },
      {
        name: 'Contact',
        link: '#',
        children: [
          {
            name: 'Twitter',
            link: 'https://twitter.com/w_zce'
          },
          {
            name: 'About',
            link: 'https://weibo.com/zceme'
          },
          {
            name: 'divider'
          },
          {
            name: 'About',
            link: 'https://github.com/zce'
          }
        ]
      }
    ],
    pkg: require('./package.json'),
    date: new Date()
  }

const useref = ()=>{
  return src("temp/*.html",{base:"temp"})
  .pipe(plugin.useref({searchPath:["temp","."]}))
  .pipe(plugin.if(/\.js$/,plugin.uglify()))
  .pipe(plugin.if(/\.css$/,plugin.cleanCss()))
  .pipe(plugin.if(/\.html$/,plugin.htmlmin({
    collapseWhitespace:true,
    minifyCss:true,
    minifyJs:true
  })))
  .pipe(dest("dist"))
}

const bs = browserSync.create();

const clean = ()=>{
    return del(["dist","temp"])
}
const style = ()=>{
    return src("src/assets/styles/*.scss",{base:"src"})//读取流
    .pipe(sass({outputStyle:"expanded"}))//展开样式
    .pipe(dest("temp"))//生成dist目录
    .pipe(bs.reload({stream:true}))
}

const script = ()=>{ //脚本编译
    return src("src/assets/scripts/*.js",{base:"src"})
    .pipe(babel({presets:["@babel/preset-env"]}))//babel 只是用来转换js语法的平台（本身没什么用）， 而perset就是转换语法的一个集合，它包含了所有es的新特性
    .pipe(dest("temp"))
    .pipe(bs.reload({stream:true}))
}

const page = ()=>{
    return src("src/*html")
    .pipe(swig({data}))
    .pipe(dest("temp"))
    .pipe(bs.reload({stream:true}))
}

const image = ()=>{
    return src("src/assets/images/**",{base:"src"})
    .pipe(plugin.imagemin())
    .pipe(dest("dist"))
}

const font = ()=>{
    return src("src/assets/fonts/**",{base:"src"})
    .pipe(plugin.imagemin())
    .pipe(dest("dist"))
}

const extra = ()=>{
    return src("public/**",{base:"public"})
    .pipe(dest("dist"))
}

const serve = ()=>{
  watch("src/assets/styles/*.scss",style)
  watch("src/assets/scripts/*.js",script)
  watch("src/*.html",page)
  watch(
   ["src/assets/images/**",
    "src/assets/fonts/**",
    "public/**",
  ],
    bs.reload
  )
  bs.init({
    notify:false,
    port:"2020",
    // files:"dist/**", //使用reload代替
    server:{
      baseDir:["temp","src","public"],
      routes:{
        "/node_modules":"node_modules"
      }
    }
  })
}
const compile = parallel(style,script,page);

//上线之前
const build =series(clean, parallel(series(useref,compile),image,font,extra));
//开发
const dev = series(clean,parallel(compile,serve))
module.exports = {
    build,
    dev,
    useref
}