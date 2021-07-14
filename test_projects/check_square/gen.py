# Input: n
# Output: yes if n is a square (x^2) else no

import random, math

def check_square(n):
    m = int(math.sqrt(n))
    for i in range(m - 2, m + 3):
        if i * i == n:
            return 'yes'
    return 'no'

for i in range(30):
    if i == 0:
        lower = 0
    else:
        lower = 1

    LIM = 10**random.randint(lower, min(7, i))
    a = random.randint(0, LIM)

    val = random.randint(0, 2)
    if val == 0:
        n = a * a
    elif val == 1:
        n = random.randint(0, a * a)
    else:
        n = random.randint(a * a - 2, a * a + 2)

    with open(f'tests/test{i}.inp', 'w') as f:
        f.write(f'{n}\n')
    with open(f'tests/test{i}.out', 'w') as f:
        f.write(f'{check_square(n)}')