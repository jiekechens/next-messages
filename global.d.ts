// 让 TypeScript 认识 Less Modules
declare module '*.module.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// 顺便把你的 ani.less 也配置上通行证（如果你没改它的后缀）
declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}