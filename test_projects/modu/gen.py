# Input:
#  n
#  m
# Output: m % (2^n)

import random, math

for i in range(20):
    LIM = 10**random.randint(0, min(8, i))
    m = random.randint(0, LIM)
    n = random.randint(0, LIM)

    if random.randint(0, 1) == 0:
        n = random.randint(0, 30)

    with open(f'tests/test{i}.inp', 'w') as f:
        f.write(f'{n}\n{m}\n')
    with open(f'tests/test{i}.out', 'w') as f:
        res = m
        if n <= 30:
            res = m % (2**n)
        f.write(f'{res}')