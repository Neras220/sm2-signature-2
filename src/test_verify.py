from sm2_core import SM2
from gmssl import sm3, func, sm2 as gmssl_sm2
import sys
import os

# 测试文件和日志配置
current_dir = os.path.dirname(os.path.abspath(__file__))
log_file = os.path.join(current_dir, "sm2_debug_log.txt")
test_file = os.path.join(current_dir, "assets", "test1.txt")

# 将输出重定向到日志文件，便于分析签名结果
sys.stdout = open(log_file, "w", encoding="utf-8")

# 初始化SM2对象和密钥
sm2 = SM2()
Px, Py = sm2.PBx, sm2.PBy  # 从SM2对象获取当前密钥对的公钥点

# 读取测试文件内容
with open(test_file, "rb") as f:
    file_content = f.read()
print("文件内容:", file_content)

# 测试自实现的SM2签名和验证
# 1. 使用标准user_id生成签名
# 2. 验证签名的正确性
r, s = sm2.sign(file_content, user_id="1234567812345678")
print("自实现签名值：")
print("r:", sm2.hex(r))  # r = (e + x1) mod n
print("s:", sm2.hex(s))  # s = ((1 + dA)^(-1) * (k - r*dA)) mod n

# 使用相同参数验证签名
is_valid = sm2.verify(file_content, (r, s), Px, Py, user_id="1234567812345678")
print("自实现验签结果:", is_valid)

# 使用官方gmssl库验证实现正确性
# 1. 配置相同的密钥对
private_key = sm2.hex(sm2.d)
public_key = sm2.hex(sm2.PBx) + sm2.hex(sm2.PBy)
sm2_crypt = gmssl_sm2.CryptSM2(public_key=public_key, private_key=private_key)

# 2. 使用gmssl生成签名
gmssl_sign = sm2_crypt.sign(file_content, private_key)
gmssl_r = int(gmssl_sign[:64], 16)  # gmssl返回的是16进制字符串，需要转换
gmssl_s = int(gmssl_sign[64:], 16)
print("\ngmssl签名值：")
print("r:", hex(gmssl_r))
print("s:", hex(gmssl_s))

# 3. 分别用gmssl和自实现验证gmssl生成的签名
print("gmssl验签结果:", sm2_crypt.verify(gmssl_sign, file_content))
gmssl_valid = sm2.verify(file_content, (gmssl_r, gmssl_s), Px, Py, user_id="1234567812345678")
print("自实现验证gmssl签名结果:", gmssl_valid)

# 交叉验证完成：
# 1. 自实现签名 -> 自实现验证
# 2. gmssl签名 -> gmssl验证
# 3. gmssl签名 -> 自实现验证
