from openpyxl import load_workbook
from glob import glob
from json import dump, load
from csv import DictReader, Dialect
import re

dataset = load(open('./gadm36_0.json', 'r'))

def get_year(filename):
    year = re.search(r"carbon_(\d{4})", filename)
    return year.group(1)

def process_file(filename):
    wb = load_workbook(filename=filename)
    worksheet = wb.active

    all_rows = list(worksheet.values)

    header = all_rows[0]
    rows = all_rows[1:]
    for row in rows:
        # skip the first column with [1:], it's just a useless
        # numeric index.
        item = dict(zip(header[1:], row[1:]))
        for i, feature in enumerate(dataset['features']):
            if feature['properties']['NAME_0'] == item['Country']:
                dataset['features'][i]['properties'] |= item


for filename in glob('./country_stats/gadm00*'):
    process_file(filename)

dump(dataset, open('./gadm36_0_joined.json', 'w'))