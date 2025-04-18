from flask import Flask, request, jsonify, send_from_directory
import os
import sys
import logging
from pathlib import Path

# 添加父目录到系统路径
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

from sm2_core import SM2
from gmssl import sm3, func

# 创建全局的SM2实例
sm2 = SM2()

def register_routes(app):
    @app.route('/')
    def root():
        return app.send_static_file('index.html')

    @app.route('/api/keypair/current', methods=['GET'])
    def get_current_keypair():
        """获取当前密钥对"""
        try:
            logging.debug(f"Current private key: {sm2.hex(sm2.d)}")
            logging.debug(f"Current public key X: {sm2.hex(sm2.PBx)}")
            logging.debug(f"Current public key Y: {sm2.hex(sm2.PBy)}")
            
            return jsonify({
                'privateKey': sm2.hex(sm2.d),
                'publicKeyX': sm2.hex(sm2.PBx),
                'publicKeyY': sm2.hex(sm2.PBy)
            })
        except Exception as e:
            logging.error(f"Error in get_current_keypair: {str(e)}", exc_info=True)
            return jsonify({'error': str(e)}), 500

    @app.route('/api/keypair/generate', methods=['POST'])
    def generate_keypair():
        """生成新的SM2密钥对"""
        try:
            sm2.setSecretKey(True)
            sm2.PBx, sm2.PBy = sm2.multiPoint([sm2.Gx, sm2.Gy], sm2.d)
            
            logging.debug(f"Generated new keypair:")
            logging.debug(f"Private key: {sm2.hex(sm2.d)}")
            logging.debug(f"Public key X: {sm2.hex(sm2.PBx)}")
            logging.debug(f"Public key Y: {sm2.hex(sm2.PBy)}")
            
            return jsonify({
                'privateKey': sm2.hex(sm2.d),
                'publicKeyX': sm2.hex(sm2.PBx),
                'publicKeyY': sm2.hex(sm2.PBy)
            })
        except Exception as e:
            logging.error(f"Error in generate_keypair: {str(e)}", exc_info=True)
            return jsonify({'error': str(e)}), 500

    @app.route('/api/sign', methods=['POST'])
    def sign_file():
        """对文件进行签名"""
        try:
            if 'file' not in request.files:
                return jsonify({'error': '未找到文件'}), 400
                
            file = request.files['file']
            if not file.filename.endswith('.txt'):
                return jsonify({'error': '仅支持.txt文件'}), 400
                
            # 读取文件内容
            file_content = file.read()
            
            # 计算文件哈希值
            file_hash = sm3.sm3_hash(func.bytes_to_list(file_content))
            
            # 生成签名
            r, s = sm2.sign(file_content)
            
            logging.debug(f"File signed successfully:")
            logging.debug(f"Hash: {file_hash}")
            logging.debug(f"Signature r: {sm2.hex(r)}")
            logging.debug(f"Signature s: {sm2.hex(s)}")
            
            return jsonify({
                'fileHash': file_hash,
                'signatureR': sm2.hex(r),
                'signatureS': sm2.hex(s)
            })
        except Exception as e:
            logging.error(f"Error in sign_file: {str(e)}", exc_info=True)
            return jsonify({'error': str(e)}), 500

    @app.route('/api/verify', methods=['POST'])
    def verify_signature():
        """验证文件签名"""
        try:
            if 'file' not in request.files:
                return jsonify({'error': '未找到文件'}), 400
                
            # 获取请求参数
            file = request.files['file']
            r = int(request.form['signatureR'], 16)
            s = int(request.form['signatureS'], 16)
            public_key_x = int(request.form['publicKeyX'], 16)
            public_key_y = int(request.form['publicKeyY'], 16)
            
            # 读取文件内容
            file_content = file.read()
            
            # 验证签名
            is_valid = sm2.verify(file_content, (r, s), public_key_x, public_key_y)
            
            logging.debug(f"Signature verification result: {is_valid}")
            
            return jsonify({
                'valid': is_valid,
                'fileHash': sm3.sm3_hash(func.bytes_to_list(file_content))
            })
        except Exception as e:
            logging.error(f"Error in verify_signature: {str(e)}", exc_info=True)
            return jsonify({'error': str(e)}), 500

    # 添加静态文件路由
    @app.route('/<path:path>')
    def serve_static(path):
        return send_from_directory('.', path)

app = Flask(__name__, static_url_path='')
register_routes(app)

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    app.run(port=5000, debug=True)