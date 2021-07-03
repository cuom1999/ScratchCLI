import random

# Try bigger limit and you will see WA :))
for i in range(15):
    LIM = 10**i
    a = random.randint(-LIM, LIM)
    b = random.randint(-LIM, LIM)
    with open(f'tests/test{i}.inp', 'w') as f:
        f.write(f'{a}\n{b}\n')
    with open(f'tests/test{i}.out', 'w') as f:
        f.write(f'{a + b}')