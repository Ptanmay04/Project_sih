import cv2
import numpy as np

# 1. Create a blank white A4-style image (800x600 pixels)
img = np.ones((600, 800, 3), dtype=np.uint8) * 255

# 2. Define text styling
font = cv2.FONT_HERSHEY_SIMPLEX
font_scale = 0.7
color = (20, 20, 20) # Dark grey/black text
thickness = 2

# 3. Define the mock land record text
lines = [
    "VILLAGE FORM SEVEN (RECORD OF RIGHTS)",
    "--------------------------------------------------",
    "State: Maharashtra",
    "District: Pune",
    "Village: Shivajinagar",
    "",
    "Khasra No: 45/2",
    "Plot Area Sqm: 1200",
    "",
    "Owner: Rahul Sharma",
    "Tenure Type: Class-1",
    "",
    "Cultivation Details: Wheat, Rain-fed"
]

# 4. Draw the text line-by-line onto the image
y_0, dy = 50, 40
for i, line in enumerate(lines):
    y = y_0 + i * dy
    cv2.putText(img, line, (50, y), font, font_scale, color, thickness, cv2.LINE_AA)

# 5. Add simulated "scanner noise" (to test our cleaning pipeline)
noise = np.random.randint(0, 40, (600, 800, 3), dtype=np.uint8)
img = cv2.subtract(img, noise)

# 6. Save the final image
cv2.imwrite("sample_land_record.jpg", img)
print("Success! 'sample_land_record.jpg' has been generated in your backend folder.")