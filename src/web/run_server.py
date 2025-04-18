import os
import sys
import logging
from datetime import datetime
from pathlib import Path
from flask import Flask
from flask_cors import CORS

# 设置工作目录
current_dir = Path(__file__).parent
os.chdir(current_dir)

# 确保能够正确导入sm2_core
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

# 设置日志目录
log_dir = current_dir
log_file = log_dir / f'web_api_{datetime.now().strftime("%Y%m%d")}.log'

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,  # 改为DEBUG级别以显示更多信息
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)

def create_app():
    app = Flask(__name__, static_folder='.', static_url_path='')
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    from api import register_routes
    register_routes(app)
    
    return app

def run_server():
    try:
        app = create_app()
        logging.info("启动Web API服务器...")
        app.run(host='127.0.0.1', port=5000, debug=True)
    except Exception as e:
        logging.error(f"启动服务器时发生错误: {str(e)}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    run_server()