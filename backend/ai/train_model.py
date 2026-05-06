import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import StandardScaler
import joblib
import os

# MOCK DATA

np.random.seed(42)
n_samples = 200

study_hours = np.random.uniform(1, 10, n_samples)
attendance = np.random.uniform(40, 100, n_samples)
previous_grade = np.random.uniform(30, 100, n_samples)

#  Pass if study_hours > 5 AND attendance > 70 AND previous_grade > 50
result = []
for i in range(n_samples):
    score = (
        (study_hours[i] / 10) * 0.35 +
        (attendance[i] / 100) * 0.35 +
        (previous_grade[i] / 100) * 0.30
    )
    # Add random noise
    score += np.random.uniform(-0.1, 0.1)
    result.append(1 if score >= 0.5 else 0)

df = pd.DataFrame({
    'study_hours': study_hours,
    'attendance': attendance,
    'previous_grade': previous_grade,
    'result': result
})

print("Dataset created:")
print(df.head(10))
print(f"\nPass: {sum(result)} | Fail: {n_samples - sum(result)}")

# PREPARE DATA

X = df[['study_hours', 'attendance', 'previous_grade']]
y = df['result']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# SCALE FEATURES
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# TRAIN AI MODEL

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)
model.fit(X_train_scaled, y_train)

# MODEL EVALUATION

y_pred = model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)

print(f"\nModel Accuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Fail', 'Pass']))

# SAVE MODEL

os.makedirs('ai', exist_ok=True)
joblib.dump(model, 'ai/model.pkl')
joblib.dump(scaler, 'ai/scaler.pkl')

print("\nModel saved to ai/model.pkl")
print("Scaler saved to ai/scaler.pkl")