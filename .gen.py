import os
html = open('landing_template.html', 'r', encoding='utf-8').read()
with open('landing.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Written landing.html OK')
