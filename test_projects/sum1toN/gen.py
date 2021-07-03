import random, math

for i in range(15):
    LIM = 10**random.randint(0, min(7, i))
    a = random.randint(0, LIM)
    with open(f'tests/test{i}.inp', 'w') as f:
        f.write(f'{a}\n')
    with open(f'tests/test{i}.out', 'w') as f:
        f.write(f'{a * (a + 1) // 2}')