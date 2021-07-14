# Input: n
# Output:
# YES if can divide n into 2 parts, each part is even and > 0
# NO else

import random, math

for i in range(15):
    if i >= 10:
        LIM = 1000
        a = random.randint(0, LIM)
    else:
        a = i
    with open(f'tests/test{i}.inp', 'w') as f:
        f.write(f'{a}\n')
    with open(f'tests/test{i}.out', 'w') as f:
        if a % 2 == 0 and a > 2:
            f.write('YES')
        else:
            f.write('NO')