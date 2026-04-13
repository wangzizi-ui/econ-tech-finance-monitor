升级版网页包说明

文件列表
1. index.html
   主页面

2. styles.css
   页面样式文件

3. script.js
   页面脚本，负责：
   - 读取 papers.json
   - 按文章自动渲染页面
   - 搜索
   - 按期刊筛选
   - 按关键词筛选
   - 排序

4. papers.json
   论文数据文件
   你以后只要替换这个文件里的内容，网页就会自动更新展示内容。

使用方法
1. 解压压缩包
2. 将所有文件一起上传到你的 GitHub 仓库根目录
3. 等 GitHub Pages 自动刷新
4. 打开你的网页链接查看效果

后续最关键的一步
把 papers.json 里的示例数据，替换成真实抓取的数据。

建议的数据字段
- title
- journal
- date
- summary
- tags
- url
- doi_url
- openalex_url

注意
当前这个版本已经比之前更接近正式学术网页，但示例链接仍是占位内容。
后续我可以继续帮你做“自动抓取版”，让 GitHub Actions 每周自动更新 papers.json。
