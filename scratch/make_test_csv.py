import pandas as pd
import numpy as np
import os

np.random.seed(42)
n = 200

customer_id = list(range(1, n + 1))
customer_email = ['user{}@test.com'.format(i) if i % 5 != 0 else None for i in range(n)]
age = [str(v) if i % 10 != 0 else 'N/A' for i, v in enumerate(np.random.randint(18, 65, n))]
revenue = list(np.random.normal(500, 100, n - 5)) + [50000, -9999, 99999, 0, 1]
region = [['North', 'South', 'East', 'West'][i % 4] for i in range(n)]

df = pd.DataFrame({
    'customer_id': customer_id,
    'customer_email': customer_email,
    'age': age,
    'revenue': revenue,
    'region': region,
})

# Add duplicates (first 20 rows repeated)
df = pd.concat([df, df.head(20)], ignore_index=True)

os.makedirs('uploads', exist_ok=True)
df.to_csv('uploads/test_dataset.csv', index=False)
print('Test CSV created: uploads/test_dataset.csv, rows={}'.format(len(df)))
