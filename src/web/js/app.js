// API端点配置
const API_BASE_URL = 'http://localhost:5000/api';

// 加载状态管理
function showLoading() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    // 使用 setTimeout 确保 DOM 更新后再添加 show 类
    setTimeout(() => {
        loading.querySelector('.loading').classList.add('show');
        loading.querySelector('.loading-overlay').classList.add('show');
    }, 10);
}

function hideLoading() {
    const loading = document.getElementById('loading');
    const loadingElement = loading.querySelector('.loading');
    const overlayElement = loading.querySelector('.loading-overlay');
    
    loadingElement.classList.remove('show');
    overlayElement.classList.remove('show');
    
    // 等待过渡效果完成后再隐藏元素
    setTimeout(() => {
        loading.style.display = 'none';
    }, 300);
}

// 工具函数
async function fetchApi(endpoint, method = 'GET', data = null, isFormData = false) {
    showLoading();
    
    try {
        const options = {
            method,
            headers: !isFormData ? {
                'Content-Type': 'application/json',
            } : {},
        };
        
        if (data) {
            options.body = isFormData ? data : JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }
        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        showToast('错误', error.message, 'danger');
        throw error;
    } finally {
        hideLoading();
    }
}

// 显示提示消息
function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <strong>${title}</strong>: ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
        if (toastContainer.children.length === 0) {
            toastContainer.remove();
        }
    }, 3000);
}

// 检查API连接状态
async function checkApiConnection() {
    const statusBadge = document.querySelector('#connectionStatus .badge');
    try {
        await fetchApi('/keypair/current');
        statusBadge.className = 'badge bg-success';
        statusBadge.textContent = '已连接';
    } catch (error) {
        statusBadge.className = 'badge bg-danger';
        statusBadge.textContent = '未连接';
    }
}

// 复制到剪贴板
async function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    try {
        await navigator.clipboard.writeText(element.value);
        showToast('成功', '已复制到剪贴板', 'success');
    } catch (err) {
        showToast('错误', '复制失败', 'danger');
    }
}

// 获取当前密钥对
async function fetchCurrentKeypair() {
    try {
        const result = await fetchApi('/keypair/current');
        
        // 更新私钥显示（默认遮挡）
        const privateKeyInput = document.getElementById('privateKey');
        privateKeyInput.type = 'password';
        privateKeyInput.value = result.privateKey;
        
        // 更新公钥显示
        document.getElementById('publicKeyX').value = result.publicKeyX;
        document.getElementById('publicKeyY').value = result.publicKeyY;
        
        // 同时更新验证页面的公钥
        document.getElementById('verifyPubX').value = result.publicKeyX;
        document.getElementById('verifyPubY').value = result.publicKeyY;
    } catch (error) {
        console.error('获取密钥对失败:', error);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        fetchCurrentKeypair(),
        checkApiConnection()
    ]);
    
    // 默认隐藏验证详细信息
    const detailsContainer = document.getElementById('verifyDetailsContainer');
    if (detailsContainer) {
        detailsContainer.classList.remove('show');
    }
});

// 每30秒检查一次连接状态
setInterval(checkApiConnection, 30000);

// 密钥管理功能
async function generateNewKeypair() {
    try {
        const result = await fetchApi('/keypair/generate', 'POST');
        
        // 更新私钥显示（默认遮挡）
        const privateKeyInput = document.getElementById('privateKey');
        privateKeyInput.type = 'password';
        privateKeyInput.value = result.privateKey;
        
        document.getElementById('publicKeyX').value = result.publicKeyX;
        document.getElementById('publicKeyY').value = result.publicKeyY;
        
        // 同时更新验证页面的公钥
        document.getElementById('verifyPubX').value = result.publicKeyX;
        document.getElementById('verifyPubY').value = result.publicKeyY;
        
        showToast('成功', '已生成新的密钥对', 'success');
    } catch (error) {
        console.error('生成密钥对失败:', error);
    }
}

async function exportKeypair() {
    try {
        const privateKey = document.getElementById('privateKey').value;
        const publicKeyX = document.getElementById('publicKeyX').value;
        const publicKeyY = document.getElementById('publicKeyY').value;
        
        if (!privateKey || !publicKeyX || !publicKeyY) {
            throw new Error('密钥对不完整');
        }
        
        const blob = new Blob([
            `私钥: ${privateKey}\n`,
            `公钥X: ${publicKeyX}\n`,
            `公钥Y: ${publicKeyY}\n`
        ], { type: 'text/plain' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sm2_keypair.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('成功', '密钥对已导出', 'success');
    } catch (error) {
        showToast('错误', error.message, 'danger');
    }
}

function importKeypair() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) {
                throw new Error('请选择文件');
            }
            
            const text = await file.text();
            const lines = text.split('\n');
            let foundKeys = false;
            
            for (const line of lines) {
                if (line.startsWith('私钥:')) {
                    document.getElementById('privateKey').value = line.split(':')[1].trim();
                    foundKeys = true;
                } else if (line.startsWith('公钥X:')) {
                    document.getElementById('publicKeyX').value = line.split(':')[1].trim();
                } else if (line.startsWith('公钥Y:')) {
                    document.getElementById('publicKeyY').value = line.split(':')[1].trim();
                }
            }
            
            if (!foundKeys) {
                throw new Error('无效的密钥文件格式');
            }
            
            // 同时更新验证页面的公钥
            document.getElementById('verifyPubX').value = document.getElementById('publicKeyX').value;
            document.getElementById('verifyPubY').value = document.getElementById('publicKeyY').value;
            
            showToast('成功', '密钥对已导入', 'success');
        } catch (error) {
            showToast('错误', error.message, 'danger');
        }
    };
    input.click();
}

// 签名功能
async function signFile() {
    const fileInput = document.getElementById('fileToSign');
    if (!fileInput.files.length) {
        showToast('错误', '请选择要签名的文件', 'danger');
        return;
    }
    
    try {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        const result = await fetchApi('/sign', 'POST', formData, true);
        
        document.getElementById('fileHash').value = result.fileHash;
        document.getElementById('signatureR').value = result.signatureR;
        document.getElementById('signatureS').value = result.signatureS;
        
        // 自动填充验证页面
        document.getElementById('verifyR').value = result.signatureR;
        document.getElementById('verifyS').value = result.signatureS;
        
        showToast('成功', '签名已生成', 'success');
        
        // 下载签名文件
        const signatureBlob = new Blob([
            `原始文件: ${file.name}\n`,
            `文件大小: ${file.size} bytes\n`,
            `签名时间: ${new Date().toLocaleString()}\n`,
            `r: ${result.signatureR}\n`,
            `s: ${result.signatureS}\n`,
            `公钥X: ${document.getElementById('publicKeyX').value}\n`,
            `公钥Y: ${document.getElementById('publicKeyY').value}\n`
        ], { type: 'text/plain' });
        
        const url = URL.createObjectURL(signatureBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name}.sig`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('签名生成失败:', error);
    }
}

// 验证功能
async function verifySignature() {
    const fileInput = document.getElementById('fileToVerify');
    if (!fileInput.files.length) {
        showToast('错误', '请选择要验证的文件', 'danger');
        return;
    }
    
    try {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        const r = document.getElementById('verifyR').value;
        const s = document.getElementById('verifyS').value;
        const pubX = document.getElementById('verifyPubX').value;
        const pubY = document.getElementById('verifyPubY').value;
        
        if (!r || !s || !pubX || !pubY) {
            throw new Error('请填写完整的验证信息');
        }
        
        formData.append('signatureR', r);
        formData.append('signatureS', s);
        formData.append('publicKeyX', pubX);
        formData.append('publicKeyY', pubY);
        
        const result = await fetchApi('/verify', 'POST', formData, true);
        const verifyResult = document.getElementById('verifyResult');
        
        if (result.valid) {
            verifyResult.className = 'mt-3 alert alert-success';
            verifyResult.textContent = '✓ 签名验证成功';
        } else {
            verifyResult.className = 'mt-3 alert alert-danger';
            verifyResult.textContent = '✗ 签名验证失败';
        }
        
    } catch (error) {
        const verifyResult = document.getElementById('verifyResult');
        verifyResult.className = 'mt-3 alert alert-danger';
        verifyResult.textContent = `✗ 验证过程出错: ${error.message}`;
    }
}

// 私钥显示控制
function togglePrivateKey() {
    const privateKeyInput = document.getElementById('privateKey');
    const toggleButton = document.getElementById('togglePrivateKey');
    
    if (privateKeyInput.type === 'password') {
        privateKeyInput.type = 'text';
        toggleButton.textContent = '隐藏';
        toggleButton.classList.remove('btn-success');
        toggleButton.classList.add('btn-warning');
    } else {
        privateKeyInput.type = 'password';
        toggleButton.textContent = '显示';
        toggleButton.classList.remove('btn-warning');
        toggleButton.classList.add('btn-success');
    }
}

// 验签界面折叠控制
function toggleVerifyDetails() {
    const detailsContainer = document.getElementById('verifyDetailsContainer');
    const toggleButton = document.getElementById('toggleVerifyDetails');
    
    if (detailsContainer.classList.contains('show')) {
        // 先改变透明度和位移
        detailsContainer.style.opacity = '0';
        detailsContainer.style.transform = 'translateY(-10px)';
        
        // 等待过渡动画完成后再移除 show 类
        setTimeout(() => {
            detailsContainer.classList.remove('show');
            toggleButton.textContent = '展开详细信息';
        }, 50);
    } else {
        detailsContainer.classList.add('show');
        // 确保DOM更新后再触发动画
        requestAnimationFrame(() => {
            detailsContainer.style.opacity = '1';
            detailsContainer.style.transform = 'translateY(0)';
        });
        toggleButton.textContent = '收起详细信息';
    }
}

// 自动导入签名文件信息
document.getElementById('signatureFile').addEventListener('change', async (e) => {
    try {
        const file = e.target.files[0];
        if (!file) {
            throw new Error('请选择签名文件');
        }
        
        const text = await file.text();
        const lines = text.split('\n');
        let foundSignature = false;
        
        for (const line of lines) {
            if (line.startsWith('r:')) {
                document.getElementById('verifyR').value = line.split(':')[1].trim();
                foundSignature = true;
            } else if (line.startsWith('s:')) {
                document.getElementById('verifyS').value = line.split(':')[1].trim();
            } else if (line.startsWith('公钥X:')) {
                document.getElementById('verifyPubX').value = line.split(':')[1].trim();
            } else if (line.startsWith('公钥Y:')) {
                document.getElementById('verifyPubY').value = line.split(':')[1].trim();
            }
        }
        
        if (!foundSignature) {
            throw new Error('无效的签名文件格式');
        }
        
        showToast('成功', '已导入签名信息', 'success');
    } catch (error) {
        showToast('错误', error.message, 'danger');
    }
});