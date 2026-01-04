// JavaScript文件 - 处理页面交互和地图功能
// 本文件包含了欢迎页表单处理和主页地图功能的实现
// 对初学者来说，理解DOM操作、事件处理和第三方库集成是关键

// DOMContentLoaded事件：当HTML文档完全加载和解析完成后触发
// 这是编写JavaScript代码的最佳时机，确保所有DOM元素都已可用
 document.addEventListener('DOMContentLoaded', function() {
    // 检查当前页面是欢迎页还是主页
    const isWelcomePage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    const isMainPage = window.location.pathname.includes('main.html');
    
    // 如果是欢迎页，初始化表单功能
    if (isWelcomePage) {
        initWelcomePage();
    }
    
    // 如果是主页，初始化地图功能
    if (isMainPage) {
        initMap();
    }
});

/**
 * 初始化欢迎页面的功能
 * 包括按钮点击事件和页面跳转
 * 
 * 这个函数负责设置欢迎页面的交互逻辑，现在是通过点击按钮直接进入主页
 */
function initWelcomePage() {
    // 开发调试用的日志输出
    console.log('初始化欢迎页面...');
    
    // 获取进入主页按钮元素
    // document.getElementById方法通过ID选择器获取DOM元素
    const enterBtn = document.getElementById('enter-btn');
    
    // 防御性编程：确保按钮元素存在再添加事件监听
    if (enterBtn) {
        // addEventListener方法用于为元素添加事件监听器
        // 参数1: 事件类型 ('click'表示点击事件)
        // 参数2: 回调函数，当事件触发时执行
        enterBtn.addEventListener('click', function() {
            console.log('点击进入主页按钮');
            
            // localStorage存储机制详解:
            // - localStorage是浏览器提供的本地存储API
            // - 存储的数据以键值对形式存在，且不会随页面刷新而丢失
            // - 存储限制约为5MB
            // - 数据只存储在客户端，不会自动同步到服务器
            
            // 记录用户访问时间到本地存储
            // new Date().toISOString()生成标准化的时间字符串
            const visitTime = new Date().toISOString();
            // localStorage.setItem(key, value)方法存储数据
            localStorage.setItem('lastVisitTime', visitTime);
            
            console.log('访问记录已保存，准备跳转到主页');
            
            // 页面跳转技术:
            // window.location.href属性用于获取或设置当前页面的URL
            // 设置新的URL值会导致浏览器导航到新页面
            window.location.href = 'main.html';
        });
    } else {
        console.warn('进入按钮元素未找到');
    }
}

/**
 * 初始化地图功能
 * 使用Leaflet.js库创建交互式地图
 * Leaflet是一个轻量级的开源JavaScript地图库
 */
function initMap() {
    console.log('初始化地图...');
    
    // 检查页面中是否有地图容器
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) {
        console.error('未找到地图容器');
        return;
    }
    
    // L.map()创建一个新的地图实例
    // 'mapContainer'是HTML中地图容器的ID
    // setView()设置地图的初始中心点和缩放级别
    // 参数格式：[纬度, 经度], 缩放级别
    const map = L.map('mapContainer').setView([39.9042, 116.4074], 13);
    
    // 定义不同的底图图层
    // tileLayer()用于加载和显示瓦片图层
    // 每个图层包含URL模板和属性配置
    const baseMaps = {
        'openstreetmap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }),
        'stamen-terrain': L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 18,
            ext: 'png'
        }),
        'stamen-watercolor': L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 1,
            maxZoom: 16,
            ext: 'jpg'
        })
    };
    
    // addTo()方法将图层添加到地图上
    // 这里默认显示OpenStreetMap图层
    baseMaps.openstreetmap.addTo(map);
    
    const geoServerConfig = {
        enabled: true,
        baseUrl: 'http://localhost:8080/geoserver',
        workspace: 'webgis',
        layer: 'visited_places',
        srsName: 'EPSG:4326'
    };
    loadVisitedPlacesFromGeoServer(map, geoServerConfig).catch(() => {
        const locations = [
            { name: '北京', lat: 39.9042, lng: 116.4074 },
            { name: '上海', lat: 31.2304, lng: 121.4737 },
            { name: '广州', lat: 23.1291, lng: 113.2644 },
            { name: '深圳', lat: 22.5431, lng: 114.0579 }
        ];
        locations.forEach(location => {
            const marker = L.marker([location.lat, location.lng]).addTo(map);
            marker.bindPopup(`<b>${location.name}</b>`);
        });
    });
    
    // 初始化地图控件
    initMapControls(map, baseMaps);
    
    console.log('地图初始化完成');
}

/**
 * 初始化地图控件功能
 * 实现放大、缩小和底图切换功能
 * @param {Object} map - Leaflet地图实例
 * @param {Object} baseMaps - 底图图层对象集合
 */
function initMapControls(map, baseMaps) {
    // 放大按钮
    const zoomInBtn = document.getElementById('zoomIn');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            map.zoomIn();
        });
    }
    
    // 缩小按钮
    const zoomOutBtn = document.getElementById('zoomOut');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            map.zoomOut();
        });
    }
    
    // 底图切换选择器
    const baseMapSelector = document.getElementById('baseMapSelector');
    if (baseMapSelector) {
        baseMapSelector.addEventListener('change', function() {
            const selectedMap = this.value;
            
            // 移除所有底图图层
            Object.keys(baseMaps).forEach(key => {
                if (map.hasLayer(baseMaps[key])) {
                    map.removeLayer(baseMaps[key]);
                }
            });
            
            // 添加选中的底图图层
            if (baseMaps[selectedMap]) {
                baseMaps[selectedMap].addTo(map);
            }
        });
    }
}

async function loadVisitedPlacesFromGeoServer(map, config) {
    if (!config.enabled) throw new Error('GeoServer disabled');
    const url = `${config.baseUrl}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=${encodeURIComponent(config.workspace + ':' + config.layer)}&outputFormat=application/json&srsName=${encodeURIComponent(config.srsName)}`;
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('WFS request failed');
    const geojson = await res.json();
    if (!geojson.features || geojson.features.length === 0) throw new Error('No features');
    const layer = L.geoJSON(geojson, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 6, color: '#1f78b4', fillColor: '#1f78b4', fillOpacity: 0.8 }),
        onEachFeature: (feature, layer) => {
            const props = feature.properties || {};
            const entries = Object.keys(props).map(k => `<div><b>${k}</b>: ${props[k]}</div>`).join('');
            layer.bindPopup(entries || '足迹点');
        }
    }).addTo(map);
    const bounds = layer.getBounds();
    if (bounds && bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
    return layer;
}
/**
 * 辅助函数：获取URL参数
 */
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**
 * 辅助函数：显示消息提示
 */
function showMessage(message, type = 'info') {
    // 这里可以扩展为更美观的消息提示组件
    alert(message);
}
