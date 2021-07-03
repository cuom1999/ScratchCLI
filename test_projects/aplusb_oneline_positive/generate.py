import random

for i in range(15):
    LIM = 10**i
    a = random.randint(0, LIM)
    b = random.randint(0, LIM)
    with open(f'tests/test{i}.inp', 'w') as f:
        f.write(f'{a} {b}')
    with open(f'tests/test{i}.out', 'w') as f:
        f.write(f'{a + b}')