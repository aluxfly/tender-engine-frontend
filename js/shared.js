/**
 * 投标引擎 - 全局共享工具库 (shared.js)
 * 提供: Toast通知 / Loading状态 / 错误提示 / 表单验证 / 统一导航
 */
(function() {
  'use strict';

  /* ========== 全局配置 ========== */
  if (!window.APP_CONFIG) {
    window.APP_CONFIG = {
      API_BASE: 'https://tender-engine-backend-production.up.railway.app',
      API_KEY: 'dev-key-2026'
    };
  }
  window.API_URL = window.APP_CONFIG.API_BASE + '/api';
  window.API_KEY = window.APP_CONFIG.API_KEY;

  /* ========== 页面路由定义 ========== */
  const NAV_ITEMS = [
    { href: 'index.html', label: '首页' },
    { href: 'projects.html', label: '项目列表' },
    { href: 'bid-manage.html', label: '标书管理' },
    { href: 'bid-dashboard.html', label: '工作台' },
    { href: 'bid-download.html', label: '标书下载' },
    { href: 'bid.html', label: '标书生成' },
  ];

  const BREADCRUMBS = {
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

  /* ========== Toast 通知系统 ========== */
  const Toast = {
    _container: null,
    _init() {
      if (this._container) return;
      this._container = document.createElement('div');
      Object.assign(this._container.style, {
        position: 'fixed', top: '80px', right: '20px', zIndex: '9999',
        display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', width: '100%',
        pointerEvents: 'none',
      });
      document.body.appendChild(this._container);
    },
    show(message, type, duration) {
      this._init();
      const cfg = {
        success: { icon: '✅', bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800' },
        error:   { icon: '❌', bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-800' },
        warning: { icon: '⚠️', bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800' },
        info:    { icon: 'ℹ️', bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-800' },
      }[type] || cfg.info;
      const el = document.createElement('div');
      el.className = `${cfg.bg} ${cfg.border} ${cfg.text} border rounded-xl shadow-lg`;
      Object.assign(el.style, {
        pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', fontSize: '14px', animation: 'toastSlideIn 0.3s ease',
      });
      el.innerHTML = `<span style="font-size:18px;flex-shrink:0">${cfg.icon}</span><span style="flex:1">${message}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:18px;cursor:pointer;opacity:0.5;padding:0 4px;color:inherit">×</button>`;
      this._container.appendChild(el);
      setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, duration || 3000);
    },
    success(msg, dur) { this.show(msg, 'success', dur); },
    error(msg, dur)   { this.show(msg, 'error', dur || 5000); },
    warning(msg, dur) { this.show(msg, 'warning', dur || 4000); },
    info(msg, dur)    { this.show(msg, 'info', dur); },
  };
  window.Toast = Toast;

  // Toast animation
  const toastStyle = document.createElement('style');
  toastStyle.textContent = '@keyframes toastSlideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}';
  document.head.appendChild(toastStyle);

  /* ========== Loading / Error 状态 ========== */
  const Loading = {
    _originals: new Map(),
    show(targetId, msg) {
      const el = document.getElementById(targetId);
      if (!el || this._originals.has(targetId)) return;
      this._originals.set(targetId, el.innerHTML);
      el.innerHTML = `<div class="flex flex-col items-center justify-center py-16"><div class="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div><p class="mt-4 text-gray-500 text-sm">${msg || '加载中...'}</p></div>`;
    },
    hide(targetId) {
      const orig = this._originals.get(targetId);
      if (orig === undefined) return;
      const el = document.getElementById(targetId);
      if (el) el.innerHTML = orig;
      this._originals.delete(targetId);
    },
    error(targetId, msg, retryFn) {
      const orig = this._originals.get(targetId);
      if (orig === undefined) return;
      const el = document.getElementById(targetId);
      if (!el) return;
      el.innerHTML = `<div class="flex flex-col items-center justify-center py-16"><div class="text-5xl mb-3">⚠️</div><p class="text-gray-500 mb-4">${msg || '加载失败，请检查网络连接'}</p>${retryFn ? `<button onclick="(${retryFn.toString()})()" class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">🔄 重试</button>` : ''}</div>`;
    },
  };
  window.Loading = Loading;

  /* ========== API 请求封装 ========== */
  async function apiFetch(path, opts = {}) {
    const url = `${window.API_URL}${path}`;
    const res = await fetch(url, {
      ...opts,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.API_KEY}`, ...opts.headers },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  }
  window.apiFetch = apiFetch;

  /* ========== 统一导航栏 ========== */
  function renderNavbar(pageFile) {
    const items = NAV_ITEMS.map(item => {
      const active = item.href === pageFile;
      return `<a href="${item.href}" class="px-3 py-2 rounded-lg text-sm font-medium transition ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}">${item.label}</a>`;
    }).join('');
    const mobileItems = NAV_ITEMS.map(item => {
      const active = item.href === pageFile;
      return `<a href="${item.href}" class="block px-3 py-2 rounded-lg text-sm font-medium ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:text-blue-600'}">${item.label}</a>`;
    }).join('');
    return `<nav class="bg-white shadow-lg sticky top-0 z-50"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between h-16"><div class="flex items-center"><a href="index.html" class="text-xl sm:text-2xl font-bold text-blue-600 flex items-center gap-2"><span>🎯</span><span class="hidden sm:inline">投标引擎</span></a></div><div class="hidden md:flex items-center space-x-1">${items}</div><div class="md:hidden flex items-center"><button id="mobile-menu-btn" class="text-gray-700 hover:text-blue-600 p-2"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg></button></div></div></div><div id="mobile-menu" class="hidden md:hidden bg-white border-t"><div class="px-4 py-3 space-y-1">${mobileItems}</div></div></nav>`;
  }
  window.renderNavbar = renderNavbar;

  /* ========== 面包屑 ========== */
  function renderBreadcrumbs(pageFile) {
    const crumbs = BREADCRUMBS[pageFile] || [];
    if (!crumbs.length) return '';
    let html = '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2"><nav class="text-sm text-gray-500" aria-label="面包屑"><ol class="flex items-center flex-wrap gap-1"><li><a href="index.html" class="hover:text-blue-600 transition">🏠 首页</a></li>';
    crumbs.forEach(c => {
      if (c.href) html += `<li><span class="mx-1">/</span><a href="${c.href}" class="hover:text-blue-600 transition">${c.label}</a></li>`;
      else html += `<li><span class="mx-1">/</span><span class="text-blue-600 font-medium">${c.label}</span></li>`;
    });
    html += '</ol></nav></div>';
    return html;
  }
  window.renderBreadcrumbs = renderBreadcrumbs;

  /* ========== 统一页脚 ========== */
  function renderFooter() {
    return `<footer class="bg-gray-800 text-white py-8 mt-12"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="grid md:grid-cols-3 gap-8"><div><h4 class="text-lg font-bold mb-2">🎯 投标引擎</h4><p class="text-gray-400 text-sm">智能中标预测平台，专注物联网卡 + 布控球招标</p></div><div><h4 class="text-lg font-bold mb-2">快速链接</h4><ul class="space-y-2 text-gray-400 text-sm"><li><a href="projects.html" class="hover:text-white transition">项目列表</a></li><li><a href="bid-manage.html" class="hover:text-white transition">标书管理</a></li><li><a href="bid-dashboard.html" class="hover:text-white transition">工作台</a></li><li><a href="bid-download.html" class="hover:text-white transition">标书下载</a></li></ul></div><div><h4 class="text-lg font-bold mb-2">技术支持</h4><p class="text-gray-400 text-sm">AI 驱动的智能投标决策系统</p></div></div><div class="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400 text-sm">&copy; 2026 投标引擎 All rights reserved.</div></div></footer>`;
  }
  window.renderFooter = renderFooter;

  /* ========== 表单验证 ========== */
  const Validator = {
    rules: {
      required: v => v && v.trim() ? null : '此项为必填',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : '邮箱格式不正确',
      phone: v => /^1[3-9]\d{9}$/.test(v) ? null : '手机号格式不正确',
      url: v => !v || /^(https?:\/\/)?[\w.-]+\.\w{2,}/.test(v) ? null : 'URL 格式不正确',
      number: v => v === '' || !isNaN(Number(v)) ? null : '请输入有效数字',
      minLength: n => v => v.length >= n ? null : `至少需要${n}个字符`,
      maxLength: n => v => v.length <= n ? null : `最多${n}个字符`,
    },
    validate(form) {
      let ok = true;
      form.querySelectorAll('[data-validate]').forEach(field => {
        const rules = field.dataset.validate.split('|');
        let err = null;
        for (const r of rules) {
          let fn;
          const mMin = r.match(/^minLength\((\d+)\)$/);
          const mMax = r.match(/^maxLength\((\d+)\)$/);
          if (mMin) fn = this.rules.minLength(parseInt(mMin[1]));
          else if (mMax) fn = this.rules.maxLength(parseInt(mMax[1]));
          else fn = this.rules[r];
          if (fn) { err = fn(field.value); if (err) break; }
        }
        this._fieldError(field, err);
        if (err) ok = false;
      });
      return ok;
    },
    _fieldError(field, msg) {
      let err = field.nextElementSibling;
      if (err && err.classList.contains('field-error')) err.remove();
      if (msg) {
        field.classList.add('border-red-500'); field.classList.remove('border-gray-300');
        err = document.createElement('p');
        err.className = 'field-error text-red-500 text-xs mt-1';
        err.textContent = msg;
        field.parentNode.insertBefore(err, field.nextSibling);
      } else {
        field.classList.remove('border-red-500'); field.classList.add('border-gray-300');
      }
    },
    bindRealtime(form) {
      form.addEventListener('input', e => {
        if (e.target.dataset && e.target.dataset.validate) {
          const rules = e.target.dataset.validate.split('|');
          let err = null;
          for (const r of rules) {
            let fn;
            const mMin = r.match(/^minLength\((\d+)\)$/);
            const mMax = r.match(/^maxLength\((\d+)\)$/);
            if (mMin) fn = this.rules.minLength(parseInt(mMin[1]));
            else if (mMax) fn = this.rules.maxLength(parseInt(mMax[1]));
            else fn = this.rules[r];
            if (fn) { err = fn(e.target.value); if (err) break; }
          }
          this._fieldError(e.target, err);
        }
      });
    },
  };
  window.Validator = Validator;

  /* ========== 自动初始化 ========== */
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });
  });
})();
