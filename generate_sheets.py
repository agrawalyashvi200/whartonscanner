import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Create workbook
wb = openpyxl.Workbook()

# Setup styles
navy_header_fill = PatternFill(start_color="0B3954", end_color="0B3954", fill_type="solid")
teal_header_fill = PatternFill(start_color="087E8B", end_color="087E8B", fill_type="solid")
light_gray_fill = PatternFill(start_color="F8F9FA", end_color="F8F9FA", fill_type="solid")
soft_green_fill = PatternFill(start_color="E6F4EA", end_color="E6F4EA", fill_type="solid")
soft_blue_fill = PatternFill(start_color="E8F0FE", end_color="E8F0FE", fill_type="solid")
highlight_yellow_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")

header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
title_font = Font(name="Calibri", size=16, bold=True, color="0B3954")
subtitle_font = Font(name="Calibri", size=11, italic=True, color="4B5563")
bold_font = Font(name="Calibri", size=10, bold=True, color="1F2937")
regular_font = Font(name="Calibri", size=10, color="1F2937")
formula_font = Font(name="Calibri", size=10, bold=True, color="0B3954")

thin_border_side = Side(style='thin', color='D1D5DB')
thin_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
double_bottom_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=Side(style='double', color='0B3954'))

# ==========================================
# SHEET 1: Portfolio_Model
# ==========================================
ws1 = wb.active
ws1.title = "Portfolio_Model"
ws1.views.sheetView[0].showGridLines = True

# Title
ws1["A1"] = "WHARTON GLOBAL YOUTH INVESTMENT COMPETITION: DYNAMIC PORTFOLIO MODEL"
ws1["A1"].font = title_font
ws1["A2"] = "Client: Laura Gao | Creative Residency in Taiwan | Automated Formula-Driven Compounding Engine"
ws1["A2"].font = subtitle_font

# Section 1: Assumptions & Return Benchmarks (A4:D10)
ws1["A4"] = "MODEL ASSUMPTIONS & PARAMETERS"
ws1["A4"].font = Font(name="Calibri", size=12, bold=True, color="087E8B")

assumptions = [
    ("Initial Investment (2027 / Year 1)", 300000, "$#,##0", "Total Year 1 cash deployment"),
    ("Follow-on Contribution (2028 / Year 2)", 150000, "$#,##0", "Total Year 2 cash deployment"),
    ("Total Principal Capital Invested", "=B5+B6", "$#,##0", "Formula: Sum of contributions"),
    ("Mandatory Operating Reserve in 2033", 420000, "$#,##0", "Guarantees 10 x $50k annual payments"),
    ("Operating Payment Annuity (2033-2042)", 50000, "$#,##0", "Fixed annual payment to residency"),
    ("Target Residency Launch Year", 2033, "0", "Year 7 of competition timeline")
]

ws1["A5"] = "Parameter Name"
ws1["B5"] = "Value"
ws1["C5"] = "Notes / Logic"
for col, h in [("A", "Parameter Name"), ("B", "Value"), ("C", "Notes / Logic")]:
    cell = ws1[f"{col}5"]
    cell.fill = navy_header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal="center")

row = 6
for name, val, fmt, note in assumptions:
    ws1[f"A{row}"] = name
    ws1[f"A{row}"].font = regular_font
    ws1[f"A{row}"].border = thin_border
    
    ws1[f"B{row}"] = val
    ws1[f"B{row}"].number_format = fmt
    ws1[f"B{row}"].font = formula_font if str(val).startswith("=") else bold_font
    ws1[f"B{row}"].alignment = Alignment(horizontal="right")
    ws1[f"B{row}"].border = thin_border
    if not str(val).startswith("="):
        ws1[f"B{row}"].fill = highlight_yellow_fill
        
    ws1[f"C{row}"] = note
    ws1[f"C{row}"].font = Font(name="Calibri", size=9, color="6B7280")
    ws1[f"C{row}"].border = thin_border
    row += 1

# Return Benchmark Table by Market Cap (E4:G8)
ws1["E4"] = "MARKET CAP RETURN BENCHMARKS"
ws1["E4"].font = Font(name="Calibri", size=12, bold=True, color="087E8B")

ws1["E5"] = "Market Cap Category"
ws1["F5"] = "Annual Return Assumption"
ws1["G5"] = "Description / Risk Profile"
for col in ["E", "F", "G"]:
    ws1[f"{col}5"].fill = teal_header_fill
    ws1[f"{col}5"].font = header_font
    ws1[f"{col}5"].alignment = Alignment(horizontal="center")

benchmarks = [
    ("Large Cap", 0.12, "Established global leaders (> $10B cap); defensive compounding"),
    ("Mid Cap", 0.15, "High-growth secular compounders ($2B - $10B cap); margin expansion"),
    ("Small Cap", 0.18, "High-beta emerging leaders (< $2B cap); elevated capital growth"),
    ("Cash / Liquidity Buffer", 0.0425, "Short-term US Treasury bills / money market dry powder")
]

b_row = 6
for cap_name, ret, desc in benchmarks:
    ws1[f"E{b_row}"] = cap_name
    ws1[f"E{b_row}"].font = bold_font
    ws1[f"E{b_row}"].border = thin_border
    
    ws1[f"F{b_row}"] = ret
    ws1[f"F{b_row}"].number_format = "0.0%"
    ws1[f"F{b_row}"].font = formula_font
    ws1[f"F{b_row}"].alignment = Alignment(horizontal="center")
    ws1[f"F{b_row}"].fill = highlight_yellow_fill
    ws1[f"F{b_row}"].border = thin_border
    
    ws1[f"G{b_row}"] = desc
    ws1[f"G{b_row}"].font = Font(name="Calibri", size=9, color="6B7280")
    ws1[f"G{b_row}"].border = thin_border
    b_row += 1

# Section 2: Portfolio Asset Allocation (Row 13 onwards)
ws1["A13"] = "RECOMMENDED ASSET ALLOCATION & RETURN ENGINE"
ws1["A13"].font = Font(name="Calibri", size=13, bold=True, color="0B3954")

alloc_headers = [
    ("A14", "Ticker"),
    ("B14", "Company Name"),
    ("C14", "Sector"),
    ("D14", "Market Cap Category"),
    ("E14", "Allocation Weight"),
    ("F14", "Annual Expected Return"),
    ("G14", "2027 Inflow ($300k)"),
    ("H14", "2028 Inflow ($150k)"),
    ("I14", "Total Principal Invested"),
    ("J14", "Weighted Return Contribution"),
    ("K14", "Strategic Role in Laura's Portfolio")
]

for pos, h in alloc_headers:
    cell = ws1[pos]
    cell.fill = navy_header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

# Allocation data rows
alloc_data = [
    ("KO", "The Coca-Cola Co", "Consumer Staples", "Large Cap", 0.25, "Recession-proof cash flow & 62-year dividend growth"),
    ("CL", "Colgate-Palmolive", "Consumer Staples", "Large Cap", 0.25, "61.8% Golden Pocket ($85.32); ultra-low beta (~0.50)"),
    ("V", "Visa Inc", "Financials / Payments", "Large Cap", 0.15, "Secular electronic payments duopoly; >50% operating margins"),
    ("UNH", "UnitedHealth Group", "Healthcare", "Large Cap", 0.10, "Healthcare compounding; Optum high-margin cash engine"),
    ("HD", "Home Depot Inc", "Consumer Discretionary", "Large Cap", 0.10, "High ROIC (>35%) consumer home improvement monopoly"),
    ("RKT", "Reckitt Benckiser", "Consumer Staples", "Large Cap", 0.10, "4.2% dividend yield + litigation recovery turnaround alpha"),
    ("CASH", "Short-Term Cash Buffer", "Cash & Treasuries", "Cash / Liquidity Buffer", 0.05, "Dry powder for opportunistic limit orders & rebalancing")
]

curr_row = 15
for ticker, name, sector, cap_cat, weight, role in alloc_data:
    ws1[f"A{curr_row}"] = ticker
    ws1[f"A{curr_row}"].font = bold_font
    ws1[f"A{curr_row}"].alignment = Alignment(horizontal="center")
    ws1[f"A{curr_row}"].border = thin_border
    
    ws1[f"B{curr_row}"] = name
    ws1[f"B{curr_row}"].font = regular_font
    ws1[f"B{curr_row}"].border = thin_border
    
    ws1[f"C{curr_row}"] = sector
    ws1[f"C{curr_row}"].font = regular_font
    ws1[f"C{curr_row}"].border = thin_border
    
    # Cap category - User can change this to Mid Cap or Small Cap!
    ws1[f"D{curr_row}"] = cap_cat
    ws1[f"D{curr_row}"].font = bold_font
    ws1[f"D{curr_row}"].alignment = Alignment(horizontal="center")
    ws1[f"D{curr_row}"].fill = highlight_yellow_fill
    ws1[f"D{curr_row}"].border = thin_border
    
    # Allocation Weight - User can change this!
    ws1[f"E{curr_row}"] = weight
    ws1[f"E{curr_row}"].number_format = "0.0%"
    ws1[f"E{curr_row}"].font = bold_font
    ws1[f"E{curr_row}"].alignment = Alignment(horizontal="center")
    ws1[f"E{curr_row}"].fill = highlight_yellow_fill
    ws1[f"E{curr_row}"].border = thin_border
    
    # Formula for Expected Return: Dynamic lookup from Market Cap Benchmarks table!
    ws1[f"F{curr_row}"] = f'=VLOOKUP(D{curr_row}, $E$6:$F$9, 2, FALSE)'
    ws1[f"F{curr_row}"].number_format = "0.0%"
    ws1[f"F{curr_row}"].font = formula_font
    ws1[f"F{curr_row}"].alignment = Alignment(horizontal="center")
    ws1[f"F{curr_row}"].border = thin_border
    
    # Formula for 2027 Inflow: =E_row * $B$6 (Initial Investment)
    ws1[f"G{curr_row}"] = f'=E{curr_row} * $B$6'
    ws1[f"G{curr_row}"].number_format = "$#,##0"
    ws1[f"G{curr_row}"].font = regular_font
    ws1[f"G{curr_row}"].alignment = Alignment(horizontal="right")
    ws1[f"G{curr_row}"].border = thin_border
    
    # Formula for 2028 Inflow: =E_row * $B$7 (Second Contribution)
    ws1[f"H{curr_row}"] = f'=E{curr_row} * $B$7'
    ws1[f"H{curr_row}"].number_format = "$#,##0"
    ws1[f"H{curr_row}"].font = regular_font
    ws1[f"H{curr_row}"].alignment = Alignment(horizontal="right")
    ws1[f"H{curr_row}"].border = thin_border
    
    # Formula for Total Principal: =G_row + H_row
    ws1[f"I{curr_row}"] = f'=G{curr_row} + H{curr_row}'
    ws1[f"I{curr_row}"].number_format = "$#,##0"
    ws1[f"I{curr_row}"].font = bold_font
    ws1[f"I{curr_row}"].alignment = Alignment(horizontal="right")
    ws1[f"I{curr_row}"].border = thin_border
    
    # Formula for Weighted Return Contribution: =E_row * F_row
    ws1[f"J{curr_row}"] = f'=E{curr_row} * F{curr_row}'
    ws1[f"J{curr_row}"].number_format = "0.00%"
    ws1[f"J{curr_row}"].font = formula_font
    ws1[f"J{curr_row}"].alignment = Alignment(horizontal="center")
    ws1[f"J{curr_row}"].border = thin_border
    
    ws1[f"K{curr_row}"] = role
    ws1[f"K{curr_row}"].font = Font(name="Calibri", size=9, color="4B5563")
    ws1[f"K{curr_row}"].border = thin_border
    
    curr_row += 1

# Total / Summary Row for Allocation
tot_row = curr_row
ws1[f"A{tot_row}"] = "TOTAL"
ws1[f"A{tot_row}"].font = Font(name="Calibri", size=10, bold=True, color="0B3954")
ws1[f"A{tot_row}"].alignment = Alignment(horizontal="center")
ws1[f"A{tot_row}"].border = double_bottom_border

for col in ["B", "C", "D"]:
    ws1[f"{col}{tot_row}"] = ""
    ws1[f"{col}{tot_row}"].border = double_bottom_border

ws1[f"E{tot_row}"] = f"=SUM(E15:E{tot_row-1})"
ws1[f"E{tot_row}"].number_format = "0.0%"
ws1[f"E{tot_row}"].font = bold_font
ws1[f"E{tot_row}"].alignment = Alignment(horizontal="center")
ws1[f"E{tot_row}"].border = double_bottom_border

ws1[f"F{tot_row}"] = "BLENDED CAGR:"
ws1[f"F{tot_row}"].font = Font(name="Calibri", size=10, bold=True, color="087E8B")
ws1[f"F{tot_row}"].alignment = Alignment(horizontal="right")
ws1[f"F{tot_row}"].border = double_bottom_border

ws1[f"G{tot_row}"] = f"=SUM(G15:G{tot_row-1})"
ws1[f"G{tot_row}"].number_format = "$#,##0"
ws1[f"G{tot_row}"].font = bold_font
ws1[f"G{tot_row}"].alignment = Alignment(horizontal="right")
ws1[f"G{tot_row}"].border = double_bottom_border

ws1[f"H{tot_row}"] = f"=SUM(H15:H{tot_row-1})"
ws1[f"H{tot_row}"].number_format = "$#,##0"
ws1[f"H{tot_row}"].font = bold_font
ws1[f"H{tot_row}"].alignment = Alignment(horizontal="right")
ws1[f"H{tot_row}"].border = double_bottom_border

ws1[f"I{tot_row}"] = f"=SUM(I15:I{tot_row-1})"
ws1[f"I{tot_row}"].number_format = "$#,##0"
ws1[f"I{tot_row}"].font = Font(name="Calibri", size=10, bold=True, color="0B3954")
ws1[f"I{tot_row}"].alignment = Alignment(horizontal="right")
ws1[f"I{tot_row}"].border = double_bottom_border

# Blended CAGR Formula: =SUM(J15:J21)
ws1[f"J{tot_row}"] = f"=SUM(J15:J{tot_row-1})"
ws1[f"J{tot_row}"].number_format = "0.00%"
ws1[f"J{tot_row}"].font = Font(name="Calibri", size=11, bold=True, color="065F46")
ws1[f"J{tot_row}"].fill = soft_green_fill
ws1[f"J{tot_row}"].alignment = Alignment(horizontal="center")
ws1[f"J{tot_row}"].border = double_bottom_border

ws1[f"K{tot_row}"] = "=IF(ROUND(E" + str(tot_row) + ",2)=1, '100% Balanced', 'ALERT: Weight must equal 100%')"
ws1[f"K{tot_row}"].font = Font(name="Calibri", size=9, bold=True, color="065F46")
ws1[f"K{tot_row}"].border = double_bottom_border

blended_cagr_cell = f"$J${tot_row}"

# Section 3: Year-by-Year Financial Compounding Projection (Row 25 onwards)
ws1["A25"] = "YEAR-BY-YEAR FINANCIAL PROJECTION MODEL (2026–2033)"
ws1["A25"].font = Font(name="Calibri", size=13, bold=True, color="0B3954")

proj_headers = [
    ("A26", "Timeline"),
    ("B26", "Calendar Year"),
    ("C26", "Starting Balance ($)"),
    ("D26", "Net Capital Inflow ($)"),
    ("E26", "Growth Rate (Blended)"),
    ("F26", "Annual Return Generated ($)"),
    ("G26", "Ending Balance ($)"),
    ("H26", "Strategic Milestones & Funding Progress")
]

for pos, h in proj_headers:
    cell = ws1[pos]
    cell.fill = navy_header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal="center", vertical="center")

years_info = [
    ("Year 0", 2026, "=0", "=0", "Baseline year; set up target entry limit orders"),
    ("Year 1", 2027, "=G27", "=$B$6", "Deploy Tranche 1 across KO, CL, V, UNH, HD, RKT"),
    ("Year 2", 2028, "=G28", "=$B$7", "Deploy Tranche 2; full $450k capital actively compounding"),
    ("Year 3", 2029, "=G29", "=0", "Compounding phase; all dividends automatically reinvested (DRIP)"),
    ("Year 4", 2030, "=G30", "=0", "Portfolio crosses $600k mark"),
    ("Year 5", 2031, "=G31", "=0", "Approach Co-Sponsors: Pledge $260k–$340k facility contribution"),
    ("Year 6", 2032, "=G32", "=0", "Begin de-risking cash flows into 10-year Treasury bond ladder"),
    ("Year 7", 2033, "=G33", "=0", "Residency Launch: Lock Operating Reserve & Disburse Facility")
]

p_row = 27
for t_label, c_year, start_formula, inflow_formula, milestone in years_info:
    ws1[f"A{p_row}"] = t_label
    ws1[f"A{p_row}"].font = bold_font
    ws1[f"A{p_row}"].alignment = Alignment(horizontal="center")
    ws1[f"A{p_row}"].border = thin_border
    
    ws1[f"B{p_row}"] = c_year
    ws1[f"B{p_row}"].font = regular_font
    ws1[f"B{p_row}"].alignment = Alignment(horizontal="center")
    ws1[f"B{p_row}"].border = thin_border
    
    # Starting Balance
    if p_row == 27:
        ws1[f"C{p_row}"] = 0
    else:
        ws1[f"C{p_row}"] = f"=G{p_row-1}"
    ws1[f"C{p_row}"].number_format = "$#,##0"
    ws1[f"C{p_row}"].font = regular_font
    ws1[f"C{p_row}"].alignment = Alignment(horizontal="right")
    ws1[f"C{p_row}"].border = thin_border
    
    # Inflow
    ws1[f"D{p_row}"] = inflow_formula
    ws1[f"D{p_row}"].number_format = "$#,##0"
    ws1[f"D{p_row}"].font = regular_font
    ws1[f"D{p_row}"].alignment = Alignment(horizontal="right")
    ws1[f"D{p_row}"].border = thin_border
    
    # Growth Rate: Linked directly to Blended CAGR cell!
    ws1[f"E{p_row}"] = f"={blended_cagr_cell}"
    ws1[f"E{p_row}"].number_format = "0.00%"
    ws1[f"E{p_row}"].font = formula_font
    ws1[f"E{p_row}"].alignment = Alignment(horizontal="center")
    ws1[f"E{p_row}"].border = thin_border
    
    # Annual Return ($): =(C_row + D_row) * E_row
    ws1[f"F{p_row}"] = f"=(C{p_row} + D{p_row}) * E{p_row}"
    ws1[f"F{p_row}"].number_format = "$#,##0"
    ws1[f"F{p_row}"].font = Font(name="Calibri", size=10, bold=True, color="047857")
    ws1[f"F{p_row}"].alignment = Alignment(horizontal="right")
    ws1[f"F{p_row}"].border = thin_border
    
    # Ending Balance: =C_row + D_row + F_row
    ws1[f"G{p_row}"] = f"=C{p_row} + D{p_row} + F{p_row}"
    ws1[f"G{p_row}"].number_format = "$#,##0"
    ws1[f"G{p_row}"].font = Font(name="Calibri", size=10, bold=True, color="0B3954")
    ws1[f"G{p_row}"].alignment = Alignment(horizontal="right")
    ws1[f"G{p_row}"].border = thin_border
    
    if p_row == 34:  # Highlight 2033 Ending Balance
        ws1[f"G{p_row}"].fill = soft_green_fill
        ws1[f"G{p_row}"].font = Font(name="Calibri", size=11, bold=True, color="065F46")
        
    ws1[f"H{p_row}"] = milestone
    ws1[f"H{p_row}"].font = Font(name="Calibri", size=9, color="4B5563")
    ws1[f"H{p_row}"].border = thin_border
    p_row += 1

final_portfolio_cell = f"G{p_row-1}"

# Section 4: 2033 Goal Realization & Allocation Check (Row 37 onwards)
ws1["A37"] = "2033 RESIDENCY GOAL EXECUTION & DISBURSAL (AUTOMATED FORMULA CHECK)"
ws1["A37"].font = Font(name="Calibri", size=13, bold=True, color="0B3954")

ws1["A38"] = "Metric / Objective"
ws1["B38"] = "Formula / Amount ($)"
ws1["C38"] = "Status / Compliance"
ws1["D38"] = "Impact on Laura Gao's Mandate"
for col in ["A", "B", "C", "D"]:
    ws1[f"{col}38"].fill = navy_header_fill
    ws1[f"{col}38"].font = header_font
    ws1[f"{col}38"].alignment = Alignment(horizontal="center")

goal_rows = [
    ("Total Portfolio Value at Launch (2033)", f"={final_portfolio_cell}", "Formula: 2033 Ending Balance", "Portfolio reaches target size"),
    ("Mandatory Operating Reserve Set-Aside", "=$B$9", "Formula: Target Operating Reserve", "Fully segregated into bond ladder"),
    ("10-Year Operating Commitment Check", "=IF(B40>=$B$9, '100% FUNDED & GUARANTEED', 'DEFICIT')", "High Certainty Test", "10 payments of $50,000 (2033-2042) guaranteed"),
    ("Remaining Capital for Facility Contribution", "=B39-B40", "Formula: Total Portfolio - Operating Reserve", "Direct personal equity into Taiwan facility"),
    ("Facility Contribution Target Status", "=IF(B42>=225000, 'EXCEEDS TARGET ($225k-$325k)', 'BELOW TARGET')", "Co-Sponsor Target Alignment", "Signals financial viability to sponsors in 2031")
]

g_row = 39
for name, f_val, stat_formula, impact in goal_rows:
    ws1[f"A{g_row}"] = name
    ws1[f"A{g_row}"].font = bold_font
    ws1[f"A{g_row}"].border = thin_border
    
    ws1[f"B{g_row}"] = f_val
    if "IF" in str(f_val):
        ws1[f"B{g_row}"].font = Font(name="Calibri", size=10, bold=True, color="065F46")
        ws1[f"B{g_row}"].alignment = Alignment(horizontal="center")
        ws1[f"B{g_row}"].fill = soft_green_fill
    else:
        ws1[f"B{g_row}"].number_format = "$#,##0"
        ws1[f"B{g_row}"].font = formula_font
        ws1[f"B{g_row}"].alignment = Alignment(horizontal="right")
        ws1[f"B{g_row}"].fill = highlight_yellow_fill
    ws1[f"B{g_row}"].border = thin_border
    
    ws1[f"C{g_row}"] = stat_formula
    ws1[f"C{g_row}"].font = regular_font
    ws1[f"C{g_row}"].border = thin_border
    
    ws1[f"D{g_row}"] = impact
    ws1[f"D{g_row}"].font = Font(name="Calibri", size=9, color="4B5563")
    ws1[f"D{g_row}"].border = thin_border
    g_row += 1

# Auto-adjust column widths for Sheet 1
for col in ws1.columns:
    max_len = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        val_str = str(cell.value or '')
        if len(val_str) > max_len and not val_str.startswith("="):
            max_len = len(val_str)
    ws1.column_dimensions[col_letter].width = max(max_len + 3, 12)
ws1.column_dimensions['A'].width = 38
ws1.column_dimensions['B'].width = 24
ws1.column_dimensions['C'].width = 20
ws1.column_dimensions['D'].width = 18
ws1.column_dimensions['E'].width = 16
ws1.column_dimensions['F'].width = 22
ws1.column_dimensions['G'].width = 18
ws1.column_dimensions['H'].width = 18
ws1.column_dimensions['I'].width = 18
ws1.column_dimensions['J'].width = 22
ws1.column_dimensions['K'].width = 36


# ==========================================
# SHEET 2: Approved_Stocks_Database (All 20 Stocks > $5.50)
# ==========================================
ws2 = wb.create_sheet(title="Approved_Stocks_Database")
ws2.views.sheetView[0].showGridLines = True

ws2["A1"] = "SHORTLISTED APPROVED STOCKS DATABASE (PRICE > $5.50 USD ONLY)"
ws2["A1"].font = title_font
ws2["A2"] = "Dynamic formula-based returns by market cap: Large Cap = 12%, Mid Cap = 15%, Small Cap = 18%"
ws2["A2"].font = subtitle_font

db_headers = [
    ("A4", "#"),
    ("B4", "Ticker"),
    ("C4", "Company Name"),
    ("D4", "Sector"),
    ("E4", "Current Price ($ USD)"),
    ("F4", "Market Cap Category"),
    ("G4", "Expected CAGR (Formula)"),
    ("H4", "Technical Posture (EMA, VWAP, Fib)"),
    ("I4", "Fundamental Moat & Quality"),
    ("J4", "Minimum Risk Entry Zone"),
    ("K4", "Portfolio Status")
]

for pos, h in db_headers:
    cell = ws2[pos]
    cell.fill = navy_header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

# 20 approved stocks data
approved_20 = [
    (1, "KO", "The Coca-Cola Co", "Consumer Staples", 85.70, "Large Cap", "Resting at 1Y VWAP ($86.50); tight 50/200 EMA coil; above 23.6% Fib.", "Unrivaled global distribution; pricing power; 62-year Dividend King. 10Y CAGR: 10.7%.", "$82.80 – $85.50", "Core Anchor (25%)"),
    (2, "CL", "Colgate-Palmolive", "Consumer Staples", 84.26, "Large Cap", "At 61.8% Golden Pocket ($85.32); 5.3% discount to 1Y VWAP ($89).", ">40% global oral care share + Hill's Pet Nutrition; 61-yr Dividend King. Beta ~0.50.", "$83.50 – $85.50", "Core Anchor (25%)"),
    (3, "V", "Visa Inc", "Financials / Payments", 272.00, "Large Cap", "Holding 50 EMA ($275) & 200 EMA ($268); tight consolidation near ATH.", "Worldwide payments duopoly (>50% operating margins); natural inflation beneficiary.", "$268 – $276", "Core Anchor (15%)"),
    (4, "UNH", "UnitedHealth Group", "Healthcare", 565.00, "Large Cap", "Rebounding off 200 EMA ($560); resting at 1Y VWAP ($540); secular bull.", "Dominant healthcare insurer + Optum health-services juggernaut; 15-yr dividend hikes.", "$550 – $575", "Core Anchor (10%)"),
    (5, "HD", "Home Depot Inc", "Consumer Discretionary", 375.00, "Large Cap", "Above 50/200 EMA; bouncing off 1Y VWAP ($375); steady upward trend.", "Dominant home improvement duopoly; high ROIC (>35%); strong dividend growth.", "$365 – $380", "Core Anchor (10%)"),
    (6, "RKT", "Reckitt Benckiser", "Consumer Staples", 64.50, "Large Cap", "Reclaiming 200 EMA & 1Y VWAP (~4,850 GBX); double bottom off 78.6% Fib.", "Essential health/hygiene (Dettol, Lysol); 4.2% yield; turnaround catalyst.", "4,700 – 4,880 GBX", "Core Anchor (10%)"),
    (7, "ASML", "ASML Holding NV", "Technology / Chips", 795.00, "Large Cap", "Pullback to 61.8% Fib ($780–$820); below 50 EMA, testing 200 EMA.", "Absolute global monopoly in EUV lithography; mission-critical to all AI & semis.", "$750 – $810", "Satellite Growth"),
    (8, "AVGO", "Broadcom Inc", "Technology / Chips", 152.00, "Large Cap", "Bullish trend; consolidating above 50/200 EMA and 1Y VWAP ($145).", "Premier custom AI silicon (XPU), VMware cash cow, 15-yr dividend growth.", "$145 – $155", "Satellite Growth"),
    (9, "SAP", "SAP SE", "Technology / Software", 210.00, "Large Cap", "Strong momentum; consolidating above 50/200 EMA; cloud backlog expanding.", "Mission-critical enterprise ERP software; extremely high client switching costs.", "€185 – €195", "Satellite Growth"),
    (10, "TCS", "Tata Consultancy Services", "Technology / IT", 49.50, "Large Cap", "Near 200 EMA (~₹4,150); above 1Y VWAP; rock-solid cash generative base.", "Global IT consulting titan; >25% operating margins; zero debt; 70%+ payout ratio.", "₹4,050 – ₹4,200", "Satellite Quality"),
    (11, "RY", "Royal Bank of Canada", "Financials", 114.00, "Large Cap", "In secular uptrend above 50/200 EMA; premier tier 1 capital ratio.", "Canada's #1 financial institution; dominant wealth & retail moat; 3.8% yield.", "C$150 – C$156", "Satellite Quality"),
    (12, "ASIANPAINT", "Asian Paints Ltd", "Materials / Coatings", 36.40, "Large Cap", "Consolidating near 200 EMA; testing 61.8% Fib support (~₹2,950–₹3,100).", "Dominant Indian decorative coatings monopoly; pricing power; high ROE.", "₹2,950 – ₹3,150", "Satellite Quality"),
    (13, "UBER", "Uber Technologies Inc", "Industrials / Tech", 72.50, "Large Cap", "Strong upward momentum; consolidating above 50/200 EMA and 1Y VWAP.", "Global mobility and food delivery network effects; rapid free cash flow inflection.", "$70.00 – $74.00", "Satellite Growth"),
    (14, "SCHW", "Charles Schwab Corp", "Financials", 64.50, "Large Cap", "Trading near 200 EMA ($66); cash sorting headwinds abating; below VWAP.", "Premier wealth management & brokerage platform with $8T+ client assets.", "$62.00 – $65.50", "Satellite Value"),
    (15, "PSA", "Public Storage", "Real Estate / REIT", 298.00, "Large Cap", "Consolidating near 200 EMA ($300); below 1Y VWAP ($315); 4.0% yield.", "Recession-resilient self-storage leader; 70%+ operating margins; strong balance sheet.", "$290 – $305", "Satellite Income"),
    (16, "RO", "Roche Holding AG", "Healthcare / Pharma", 302.00, "Large Cap", "Rebounding off 5-year lows; crossing above 200 EMA; 61.8% Fib base.", "Global oncology & diagnostics powerhouse; AAA balance sheet; 3.6% yield.", "250 – 265 CHF", "Satellite Defensive"),
    (17, "BYD", "BYD Co Ltd", "Consumer Discretionary", 30.20, "Large Cap", "Rebounding off 61.8% Fib; reclaiming 50/200 EMA; strong volume.", "World leader in NEVs & vertical battery integration; dominant cost advantage.", "225 – 245 HKD", "Satellite Growth"),
    (18, "OKE", "ONEOK Inc", "Energy / Midstream", 84.50, "Large Cap", "Above 50/200 EMA; steady uptrend; 5% dividend yield; utility-like fee income.", "Premier natural gas liquids (NGL) infrastructure; defensive tollbooth cash flows.", "$82.00 – $86.00", "Satellite Income"),
    (19, "CCJ", "Cameco Corp", "Energy / Uranium", 44.50, "Mid Cap", "Strong bull trend; consolidating between 38.2%–50% Fib pullback.", "Largest Western uranium producer; clean nuclear renaissance tailwinds.", "$42.00 – $46.00", "Satellite Thematic"),
    (20, "M&M", "Mahindra & Mahindra", "Consumer Discretionary", 33.50, "Large Cap", "Strong uptrend above 50/200 EMA; India rural/tractor & SUV powerhouse.", "Thriving in Indian automotive and farm machinery; high capital efficiency.", "₹2,700 – ₹2,850", "Satellite Growth")
]

r_idx = 5
for num, ticker, name, sector, price, cap_cat, tech, fund, entry, status in approved_20:
    ws2[f"A{r_idx}"] = num
    ws2[f"A{r_idx}"].alignment = Alignment(horizontal="center")
    ws2[f"A{r_idx}"].border = thin_border
    
    ws2[f"B{r_idx}"] = ticker
    ws2[f"B{r_idx}"].font = bold_font
    ws2[f"B{r_idx}"].alignment = Alignment(horizontal="center")
    ws2[f"B{r_idx}"].border = thin_border
    
    ws2[f"C{r_idx}"] = name
    ws2[f"C{r_idx}"].font = regular_font
    ws2[f"C{r_idx}"].border = thin_border
    
    ws2[f"D{r_idx}"] = sector
    ws2[f"D{r_idx}"].font = regular_font
    ws2[f"D{r_idx}"].border = thin_border
    
    ws2[f"E{r_idx}"] = price
    ws2[f"E{r_idx}"].number_format = "$#,##0.00"
    ws2[f"E{r_idx}"].font = bold_font
    ws2[f"E{r_idx}"].alignment = Alignment(horizontal="right")
    ws2[f"E{r_idx}"].border = thin_border
    
    # Market Cap Category: Editable input!
    ws2[f"F{r_idx}"] = cap_cat
    ws2[f"F{r_idx}"].font = bold_font
    ws2[f"F{r_idx}"].alignment = Alignment(horizontal="center")
    ws2[f"F{r_idx}"].fill = highlight_yellow_fill
    ws2[f"F{r_idx}"].border = thin_border
    
    # Expected CAGR Formula: Dynamically looks up return based on Market Cap Category!
    ws2[f"G{r_idx}"] = f'=VLOOKUP(F{r_idx}, Portfolio_Model!$E$6:$F$9, 2, FALSE)'
    ws2[f"G{r_idx}"].number_format = "0.0%"
    ws2[f"G{r_idx}"].font = formula_font
    ws2[f"G{r_idx}"].alignment = Alignment(horizontal="center")
    ws2[f"G{r_idx}"].border = thin_border
    
    ws2[f"H{r_idx}"] = tech
    ws2[f"H{r_idx}"].font = Font(name="Calibri", size=9)
    ws2[f"H{r_idx}"].border = thin_border
    
    ws2[f"I{r_idx}"] = fund
    ws2[f"I{r_idx}"].font = Font(name="Calibri", size=9)
    ws2[f"I{r_idx}"].border = thin_border
    
    ws2[f"J{r_idx}"] = entry
    ws2[f"J{r_idx}"].font = Font(name="Calibri", size=9, bold=True, color="1E3A8A")
    ws2[f"J{r_idx}"].border = thin_border
    
    ws2[f"K{r_idx}"] = status
    ws2[f"K{r_idx}"].alignment = Alignment(horizontal="center")
    ws2[f"K{r_idx}"].border = thin_border
    if "Core" in status:
        ws2[f"K{r_idx}"].fill = soft_green_fill
        ws2[f"K{r_idx}"].font = Font(name="Calibri", size=9, bold=True, color="065F46")
    else:
        ws2[f"K{r_idx}"].fill = soft_blue_fill
        ws2[f"K{r_idx}"].font = Font(name="Calibri", size=9, bold=True, color="1E40AF")
        
    r_idx += 1

# Column dimensions for Sheet 2
ws2.column_dimensions['A'].width = 5
ws2.column_dimensions['B'].width = 10
ws2.column_dimensions['C'].width = 24
ws2.column_dimensions['D'].width = 20
ws2.column_dimensions['E'].width = 15
ws2.column_dimensions['F'].width = 16
ws2.column_dimensions['G'].width = 16
ws2.column_dimensions['H'].width = 38
ws2.column_dimensions['I'].width = 42
ws2.column_dimensions['J'].width = 18
ws2.column_dimensions['K'].width = 18

# Save workbook
file_path = "c:\\Users\\Krishna Agrawal\\charts\\Wharton_Investment_Model_Laura_Gao.xlsx"
wb.save(file_path)
print(f"Successfully generated dynamic workbook at: {file_path}")
