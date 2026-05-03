/**
 * Day 5 批量更新脚本 - 统一 19 个页面的导航、面包屑、页脚、shared.js 引用
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// 页面配置：每个页面的 active 页面
const PAGE_CONFIG = {
  'index.html': { active: 'index.html', hasShared: false, needNav: false, needFooter: false },
  'projects.html': { active: 'projects.html', hasShared: false, needNav: true, needFooter: true, addAppConfig: true },
  'project-detail.html': { active: 'project-detail.html', hasShared: false, needNav: true, needFooter: true },
  'bid.html': { active: 'bid.html', hasShared: false, needNav: true, needFooter: true, addAppConfig: true },
  'bid-manage.html': { active: 'bid-manage.html', hasShared: false, needNav: true, needFooter: true, keepContent: true },
  'bid-create.html': { active: 'bid-create.html', hasShared: false, needNav: true, needFooter: true },
  'bid-upload.html': { active: 'bid-upload.html', hasShared: false, needNav: true, needFooter: true },
  'bid-company.html': { active: 'bid-company.html', hasShared: false, needNav: true, needFooter: true },
  'bid-team.html': { active: 'bid-team.html', hasShared: false, needNav: true, needFooter: true },
  'bid-cases.html': { active: 'bid-cases.html', hasShared: false, needNav: true, needFooter: true },
  'bid-requirements.html': { active: 'bid-requirements.html', hasShared: false, needNav: true, needFooter: true },
  'bid-fill.html': { active: 'bid-fill.html', hasShared: false, needNav: true, needFooter: true },
  'bid-preview.html': { active: 'bid-preview.html', hasShared: false, needNav: true, needFooter: true },
  'bid-supplement.html': { active: 'bid-supplement.html', hasShared: false, needNav: true, needFooter: true },
  'bid-ai-edit.html': { active: 'bid-ai-edit.html', hasShared: false, needNav: true, needFooter: true },
  'bid-realtime-preview.html': { active: 'bid-realtime-preview.html', hasShared: false, needNav: true, needFooter: true },
  'bid-check-result.html': { active: 'bid-check-result.html', hasShared: false, needNav: true, needFooter: true },
  'bid-dashboard.html': { active: 'bid-dashboard.html', hasShared: false, needNav: true, needFooter: true, lazyChart: true },
  'bid-download.html': { active: 'bid-download.html', hasShared: false, needNav: true, needFooter: true },
};

const NAV_ITEMS = [
  { href: 'index.html', label: '首页' },
  { href: 'projects.html', label: '项目列表' },
  { href: 'bid-manage.html', label: '标书管理' },
  { href: 'bid-dashboard.html', label: '工作台' },
  { href: 'bid-download.html', label: '标书下载' },
  { href: 'bid.html', label: '标书生成' },
];

function buildNavbar(activePage) {
  const desktopLinks = NAV_ITEMS.map(item => {
    const isActive = item.href === activePage;
    const cls = isActive 
      ? 'text-primary font-medium' 
      : 'text-gray-700 hover:text-primary font-medium';
    return `<a href="${item.href}" class="${cls}">${item.label}</a>`;
  }).join('\n                    ');

  const mobileLinks = NAV_ITEMS.map(item => {
    const isActive = item.href === activePage;
    const cls = isActive ? 'text-primary font-medium' : 'text-gray-700 hover:text-primary';
    return `<a href="${item.href}" class="block py-2 ${cls}">${item.label}</a>`;
  }).join('\n                ');

  return `    <!-- 导航栏 -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="index.html" class="text-2xl font-bold text-primary">🎯 投标引擎</a>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    ${desktopLinks}
                    <button class="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition">立即试用</button>
                </div>
                <div class="md:hidden flex items-center">
                    <button id="mobile-menu-btn" class="text-gray-700 hover:text-primary">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                </div>
            </div>
        </div>
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
            <div class="px-4 py-2 space-y-2">
                ${mobileLinks}
            </div>
        </div>
    </nav>`;
}

function buildBreadcrumbs(pageFile) {
  const crumbs = {
    'index.html': [],
    'projects.html': [{ label: '项目列表' }],
    'project-detail.html': [{ label: '项目列表', href: 'projects.html' }, { label: '项目详情' }],
    'bid-manage.html': [{ label: '标书管理' }],
    'bid-create.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '创建标书' }],
    'bid-upload.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '上传招标文件' }],
    'bid-company.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '公司资料' }],
    'bid-team.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '团队人员' }],
    'bid-cases.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '业绩案例' }],
    'bid-requirements.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '资料需求清单' }],
    'bid-fill.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '补充资料' }],
    'bid-preview.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '标书预览' }],
    'bid-supplement.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '补充资料工作台' }],
    'bid-ai-edit.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: 'AI 智能编辑' }],
    'bid-realtime-preview.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '实时预览' }],
    'bid-check-result.html': [{ label: '标书管理', href: 'bid-manage.html' }, { label: '校验报告' }],
    'bid-dashboard.html': [{ label: '工作台总览' }],
    'bid-download.html': [{ label: '标书下载' }],
    'bid.html': [{ label: '标书生成' }],
  };
  
  const items = crumbs[pageFile] || [];
  if (!items.length) return '';

  let html = `
    <!-- 面包屑导航 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="text-sm text-gray-500" aria-label="面包屑导航">
            <ol class="flex items-center space-x-2 flex-wrap">
                <li><a href="index.html" class="hover:text-primary transition">🏠 首页</a></li>`;
  
  for (const crumb of items) {
    if (crumb.href) {
      html += `<li class="flex items-center"><span class="mx-1">/</span><a href="${crumb.href}" class="hover:text-primary transition">${crumb.label}</a></li>`;
    } else {
      html += `<li class="flex items-center"><span class="mx-1">/</span><span class="text-primary font-medium">${crumb.label}</span></li>`;
    }
  }
  
  html += `</ol></nav></div>`;
  return html;
}

function buildFooter() {
  return `
    <!-- 页脚 -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-3 gap-8">
                <div>
                    <h4 class="text-lg font-bold mb-2">🎯 投标引擎</h4>
                    <p class="text-gray-400 text-sm">智能中标预测平台，专注物联网卡 + 布控球招标</p>
                </div>
                <div>
                    <h4 class="text-lg font-bold mb-2">快速链接</h4>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="projects.html" class="hover:text-white transition">项目列表</a></li>
                        <li><a href="bid-manage.html" class="hover:text-white transition">标书管理</a></li>
                        <li><a href="bid-dashboard.html" class="hover:text-white transition">工作台</a></li>
                        <li><a href="bid-download.html" class="hover:text-white transition">标书下载</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-bold mb-2">技术支持</h4>
                    <p class="text-gray-400 text-sm">基于 AI 驱动的智能投标决策系统</p>
                </div>
            </div>
            <div class="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400 text-sm">
                &copy; 2026 投标引擎 All rights reserved.
            </div>
        </div>
    </footer>`;
}

const SHARED_SCRIPT = `    <script src="js/shared.js"></script>`;
const APP_CONFIG_SCRIPT = `    <script>
    window.APP_CONFIG = {
        API_BASE: 'https://tender-engine-backend-production.up.railway.app',
        API_KEY: 'dev-key-2026'
    };
    </script>`;

// Process each file
const pages = fs.readdirSync(DIR).filter(f => f.endsWith('.html') && PAGE_CONFIG[f]);
let updated = 0;

for (const file of pages) {
  const filePath = path.join(DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const cfg = PAGE_CONFIG[file];
  let changed = false;

  // 1. Add shared.js before </head>
  if (!html.includes('js/shared.js')) {
    html = html.replace('</head>', `    ${SHARED_SCRIPT}\n</head>`);
    changed = true;
  }

  // 2. Replace navigation (find <nav ...> ... </nav> pattern - first nav)
  if (cfg.needNav) {
    // Match from <!-- 导航栏 --> to </nav>
    const navStart = html.indexOf('<!-- 导航栏 -->');
    if (navStart === -1) {
      // Try to match from <nav class=
      const navMatch = html.match(/<nav class="[^"]*">[\s\S]*?<\/nav>/);
      if (navMatch) {
        html = html.replace(navMatch[0], buildNavbar(cfg.active));
        changed = true;
      }
    } else {
      // Find the end of this nav block
      let navEnd = html.indexOf('</nav>', navStart);
      if (navEnd !== -1) {
        // Also skip any following mobile menu div that's part of the nav
        const afterNav = html.substring(navEnd + 6);
        const mobileMatch = afterNav.match(/^(\s*<div id="mobile-menu"[\s\S]*?<\/div>)/);
        if (mobileMatch) {
          navEnd += 6 + mobileMatch[1].length;
        }
        html = html.substring(0, navStart) + buildNavbar(cfg.active) + html.substring(navEnd);
        changed = true;
      }
    }
  }

  // 3. Add APP_CONFIG if missing
  if (cfg.addAppConfig && !html.includes('APP_CONFIG')) {
    // Insert after tailwind config script
    const twEnd = html.indexOf("</script>", html.indexOf("tailwind.config"));
    if (twEnd !== -1) {
      html = html.substring(0, twEnd + 9) + `\n    ${APP_CONFIG_SCRIPT}` + html.substring(twEnd + 9);
      changed = true;
    }
  }

  // 4. Add breadcrumbs after nav (before first section after nav)
  if (cfg.needNav) {
    const breadcrumbs = buildBreadcrumbs(file);
    if (breadcrumbs && !html.includes('面包屑导航')) {
      // Insert after </nav> (the one we just replaced)
      const navIndex = html.indexOf('<!-- 导航栏 -->');
      if (navIndex !== -1) {
        const afterNavClose = html.indexOf('</nav>', navIndex);
        if (afterNavClose !== -1) {
          const insertPos = afterNavClose + 6;
          html = html.substring(0, insertPos) + breadcrumbs + html.substring(insertPos);
          changed = true;
        }
      }
    }
  }

  // 5. Replace footer
  if (cfg.needFooter) {
    const footerMatch = html.match(/<footer[\s\S]*<\/footer>/);
    if (footerMatch) {
      html = html.replace(footerMatch[0], buildFooter());
      changed = true;
    }
  }

  // 6. Lazy load Chart.js for bid-dashboard.html
  if (cfg.lazyChart && html.includes('cdn.jsdelivr.net/npm/chart.js')) {
    // Remove the eager script tag
    html = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js[^"]*"[^>]*><\/script>/gi, '');
    // Add lazy loading script
    html = html.replace('</head>', `    <script>
    // 延迟加载 Chart.js - 等页面核心内容加载后再加载图表库
    function loadChartJS() {
        return new Promise((resolve, reject) => {
            if (window.Chart) { resolve(); return; }
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }
    </script>
</head>`);
    // Modify the script section to use lazy loading
    if (html.includes('new Chart(')) {
      html = html.replace(
        /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/,
        `document.addEventListener('DOMContentLoaded', async () => {
    // 延迟加载 Chart.js
    await loadChartJS();`
      );
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
    console.log(`✅ Updated: ${file}`);
  } else {
    console.log(`⏭️  Skipped (no changes): ${file}`);
  }
}

console.log(`\n📊 Done! ${updated}/${pages.length} files updated.`);
