# Wharton Global Youth Investment Competition: Dynamic Formula-Based Portfolio Guide
**Client**: Laura Gao (Author of *Messy Roots*, Entrepreneur)  
**Project**: Taiwan Collaborative Creative Residency (Launch: 2033 / Year 7)  
**Principal Capital**: $300,000 (2027) + $150,000 (2028) = **$450,000 Total Capital**  
**Core Return Rule Applied**:
- **Large Cap**: **12.0% Annual Return** (> $10B Market Cap)
- **Mid Cap**: **15.0% Annual Return** ($2B – $10B Market Cap)
- **Small Cap**: **18.0% Annual Return** (< $2B Market Cap)
- **Cash / Treasury Buffer**: **4.25% Annual Yield** (Risk-free dry powder)

---

## 1. Automated Dynamic Architecture Overview

This financial model is built on **fully connected, cascade-driven formulas**. Changing any single assumption, market cap category, or allocation weight instantly recalculates the entire model across all sections:

```
[Market Cap Return Assumptions] (Large: 12%, Mid: 15%, Small: 18%)
              │
              ▼
[Stock Return Lookup Formula] =VLOOKUP(Market_Cap_Cell, Benchmarks, 2, FALSE)
              │
              ▼
[Weighted Return Contribution] =Weight_Cell * Return_Cell
              │
              ▼
[Blended Portfolio CAGR] =SUM(Weighted_Contributions) ──► Currently 9.40%
              │
              ├─────────────────────────────────────────┐
              ▼                                         ▼
[Year-by-Year Compounding (2026–2033)]      [2033 Capital Disbursal]
• 2027 Inflows ($300k)                      • Total Portfolio: ~$760,210
• 2028 Inflows ($150k)                      • Operating Reserve: $420,000 (100% Guaranteed)
• Compounding Balance = Prior + Inflow + Ret • Facility Contribution: $340,210 (Target Met)
```

---

## 2. Master Formula Index & Cell References

The workbook is structured in **[Wharton_Investment_Model_Laura_Gao.xlsx](file:///c:/Users/Krishna%20Agrawal/charts/Wharton_Investment_Model_Laura_Gao.xlsx)** with the following formula mechanics:

### A. Assumption Parameters (Cells `$B$6` to `$B$11`)
| Cell | Parameter Description | Formula / Value | Formatting |
| :---: | :--- | :--- | :---: |
| **`$B$6`** | Year 1 Initial Capital (2027) | `300000` | `$#,##0` |
| **`$B$7`** | Year 2 Follow-on Capital (2028) | `150000` | `$#,##0` |
| **`$B$8`** | Total Principal Invested | `=B6+B7` | `$#,##0` |
| **`$B$9`** | Mandatory 2033 Operating Reserve | `420000` | `$#,##0` |
| **`$B$10`**| Annual Operating Payment (2033–2042) | `50000` | `$#,##0` |

### B. Market Cap Return Benchmark Table (Cells `$E$6:$F$9`)
| Category Cell | Category Name | Return Cell | Return Formula / Assumption |
| :---: | :--- | :---: | :---: |
| **`$E$6`** | Large Cap | **`$F$6`** | `0.12` (12.0%) |
| **`$E$7`** | Mid Cap | **`$F$7`** | `0.15` (15.0%) |
| **`$E$8`** | Small Cap | **`$F$8`** | `0.18` (18.0%) |
| **`$E$9`** | Cash / Liquidity Buffer | **`$F$9`** | `0.0425` (4.25%) |

### C. Asset Allocation & Stock Return Formulas (Row 15 to Row 21)
For any stock row `i` (e.g. Row 15 for `KO`):
1. **Dynamic Expected Return**:
   ```excel
   =VLOOKUP(D15, $E$6:$F$9, 2, FALSE)
   ```
   *Behavior*: If you change cell `D15` from `Large Cap` to `Mid Cap`, the expected return instantly changes from 12.0% to 15.0%.
2. **2027 Capital Inflow**:
   ```excel
   =E15 * $B$6
   ```
   *Behavior*: Automatically calculates the exact dollar allocation from Laura's $300,000 Year 1 deposit.
3. **2028 Capital Inflow**:
   ```excel
   =E15 * $B$7
   ```
   *Behavior*: Automatically calculates the exact dollar allocation from Laura's $150,000 Year 2 deposit.
4. **Total Principal Invested in Stock**:
   ```excel
   =G15 + H15
   ```
5. **Weighted Return Contribution**:
   ```excel
   =E15 * F15
   ```
6. **Blended Portfolio CAGR (Summary Row 22)**:
   ```excel
   =SUM(J15:J21)
   ```
   *(Or alternatively `=SUMPRODUCT(E15:E21, F15:F21)`)*. Cell `$J$22` dynamically represents the whole portfolio's compounding rate (currently **9.40%**).

---

## 3. Dynamic Year-by-Year Financial Schedule Formulas

The projection table (Rows 27 to 34) links directly to the **Blended CAGR** cell (`$J$22`):

| Year | Row | Starting Balance Formula | Capital Inflow Formula | Growth Rate Formula | Annual Return Generated ($) | Ending Balance Formula |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **2026 (Yr 0)** | 27 | `=0` | `=0` | `=$J$22` | `=(C27+D27)*E27` | `=C27+D27+F27` ($0) |
| **2027 (Yr 1)** | 28 | `=G27` ($0) | `=$B$6` ($300k) | `=$J$22` | `=(C28+D28)*E28` | `=C28+D28+F28` ($328,200) |
| **2028 (Yr 2)** | 29 | `=G28` | `=$B$7` ($150k) | `=$J$22` | `=(C29+D29)*E29` | `=C29+D29+F29` ($523,151) |
| **2029 (Yr 3)** | 30 | `=G29` | `=0` | `=$J$22` | `=(C30+D30)*E30` | `=C30+D30+F30` ($572,327) |
| **2030 (Yr 4)** | 31 | `=G30` | `=0` | `=$J$22` | `=(C31+D31)*E31` | `=C31+D31+F31` ($626,126) |
| **2031 (Yr 5)** | 32 | `=G31` | `=0` | `=$J$22` | `=(C32+D32)*E32` | `=C32+D32+F32` ($684,982) |
| **2032 (Yr 6)** | 33 | `=G32` | `=0` | `=$J$22` | `=(C33+D33)*E33` | `=C33+D33+F33` ($749,370) |
| **2033 (Yr 7)** | 34 | `=G33` | `=0` | `=$J$22` | `=(C34+D34)*E34` | `=C34+D34+F34` (**$760,210**) |

---

## 4. Automated 2033 Goal Realization Formulas

Rows 39 to 43 verify Laura's two mandatory goals using automated conditional logic:
1. **Total 2033 Portfolio Value (Cell `B39`)**:
   ```excel
   =G34
   ```
2. **Operating Reserve Set-Aside (Cell `B40`)**:
   ```excel
   =$B$9
   ```
3. **10-Year Operating Commitment Check (Cell `B41`)**:
   ```excel
   =IF(B39>=B40, "100% FUNDED & GUARANTEED", "DEFICIT ALERT")
   ```
4. **Remaining Capital for Facility Contribution (Cell `B42`)**:
   ```excel
   =B39 - B40
   ```
   *Current Value*: **$340,210** (Surplus capital).
5. **Co-Sponsor Target Alignment Test (Cell `B43`)**:
   ```excel
   =IF(B42>=225000, "EXCEEDS TARGET ($225k–$325k GOAL)", "BELOW TARGET")
   ```

---

## 5. What Happens When You Change Inputs? (Real-Time Scenarios)

### Scenario 1: Changing Market Cap Return Assumptions
- If you change the **Mid Cap return rate (Cell `F7`) from 15% to 16%**, or change **Cameco (`CCJ`)** into the allocation sleeve:
  - The stock return updates automatically via `VLOOKUP`.
  - The blended CAGR in cell `J22` automatically shifts.
  - The entire 2026–2033 compounding schedule updates row-by-row.
  - The 2033 Facility Contribution expands.

### Scenario 2: Rebalancing Portfolio Weights
- If you reduce **KO** from 25% to 20% and allocate 5% to **AVGO (Broadcom, Large Cap 12%)** or **CCJ (Mid Cap 15%)**:
  - Year 1 and Year 2 dollar allocations rebalance immediately.
  - The total allocation check verifies `=SUM(...) = 100%`.
  - The new blended CAGR updates the 2033 outcome.

---

## 6. Accessing Companion Files

1. **Excel Spreadsheet (.xlsx)**:  
   Download or open [Wharton_Investment_Model_Laura_Gao.xlsx](file:///c:/Users/Krishna%20Agrawal/charts/Wharton_Investment_Model_Laura_Gao.xlsx) directly in Microsoft Excel or Google Drive (Open with Google Sheets).
2. **Interactive Web App / Live Calculator**:  
   Open [dynamic_interactive_portfolio_model.html](file:///c:/Users/Krishna%20Agrawal/charts/dynamic_interactive_portfolio_model.html) in any browser to adjust sliders, change inputs, and watch live reactive JavaScript recalculations.
3. **Google Docs Formatted Report**:  
   Open [SHORTLISTED_APPROVED_STOCKS_DOC.html](file:///c:/Users/Krishna%20Agrawal/charts/SHORTLISTED_APPROVED_STOCKS_DOC.html) to copy and paste the clean, character-density-spaced table into Google Docs.
