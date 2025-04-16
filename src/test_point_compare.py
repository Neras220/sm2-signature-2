from sm2_core import SM2
from gmssl import sm2 as gmssl_sm2

# 初始化SM2类和基础参数
sm2 = SM2()
Px, Py = sm2.PBx, sm2.PBy  # 当前密钥对的公钥点
Gx, Gy = sm2.Gx, sm2.Gy    # SM2曲线的基点G
n = sm2.n                   # 基点G的阶

# 选取特定的测试用例k进行标量乘法验证
# 包含：1,2,3(小数验证基本正确性)
# 10,100(中等大小数验证)
# 123456(较大数验证)
# n-1(接近阶n的边界值验证)
k_list = [1, 2, 3, 10, 100, 123456, n-1]

# 初始化官方gmssl库用于结果对比
private_key = sm2.hex(sm2.d)
public_key = sm2.hex(Px) + sm2.hex(Py)
sm2_crypt = gmssl_sm2.CryptSM2(public_key=public_key, private_key=private_key)

print("对比multiPoint(椭圆曲线标量乘法)结果：")
for k in k_list:
    # 使用自实现的标量乘法计算kG
    my_point = sm2.multiPoint([Gx, Gy], k)
    
    # 使用gmssl库的实现计算kG
    gmssl_point = sm2_crypt._kg(k, sm2_crypt.ecc_table['g'])
    gmssl_x = int(gmssl_point[0:64], 16)
    gmssl_y = int(gmssl_point[64:], 16)
    
    print(f"k={k}")
    print(f"  自实现: x={hex(my_point[0])}\ny={hex(my_point[1])}")
    print(f"  gmssl:  x={hex(gmssl_x)}\ny={hex(gmssl_y)}")
    print(f"  是否一致: {my_point[0]==gmssl_x and my_point[1]==gmssl_y}")
    print("-")

# 测试椭圆曲线点加法
print("\n对比addPoint(椭圆曲线点加法)结果：")
points = [
    ([Gx, Gy], [Px, Py]),  # 基点G和公钥点P的加法
    ([Gx, Gy], [Gx, Gy]),  # G+G，验证同点加法(倍点)
    ([Px, Py], [Px, Py]),  # P+P，验证同点加法(倍点)
]

for P, Q in points:
    # 使用自实现的点加法
    my_add = sm2.addPoint(P, Q)
    # gmssl库没有直接暴露点加法接口，这里只测试自实现结果
    print(f"P=({hex(P[0])}, {hex(P[1])})\nQ=({hex(Q[0])}, {hex(Q[1])})")
    print(f"  加法结果: x={hex(my_add[0]) if my_add else None}\ny={hex(my_add[1]) if my_add else None}")
    print("-")

print("\n如需更详细对比，可补充更多k和点对。")
