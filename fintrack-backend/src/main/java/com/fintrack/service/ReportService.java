package com.fintrack.service;

import com.fintrack.entity.Transaction;
import com.fintrack.entity.TransactionType;
import com.fintrack.entity.User;
import com.fintrack.repository.TransactionRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public ReportService(TransactionRepository transactionRepository, UserService userService) {
        this.transactionRepository = transactionRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportPDF(LocalDate start, LocalDate end) {
        User user = userService.getCurrentUser();
        List<Transaction> transactions = transactionRepository.findByUserAndDateBetweenOrderByDateDesc(user, start, end);

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Set Document Styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(43, 82, 255));
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(100, 116, 139));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(51, 65, 85));

            // Title
            Paragraph title = new Paragraph("FinTrack Pro - Financial Statement", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(4f);
            document.add(title);

            // Subtitle
            Paragraph subtitle = new Paragraph("Statement Period: " + start.toString() + " to " + end.toString() 
                    + "\nAccount holder: " + user.getUsername() + " (" + user.getEmail() + ")", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20f);
            document.add(subtitle);

            // Table Structure
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new int[]{2, 4, 3, 2, 2});

            // Table Headers
            String[] headers = {"Date", "Description", "Category", "Type", "Amount"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(header, headerFont));
                cell.setBackgroundColor(new Color(43, 82, 255));
                cell.setPadding(8f);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBorderWidth(1f);
                cell.setBorderColor(new Color(226, 232, 240));
                table.addCell(cell);
            }

            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;

            // Table Rows
            int index = 0;
            for (Transaction tx : transactions) {
                // Alternating backgrounds
                Color bg = (index % 2 == 0) ? new Color(248, 250, 252) : Color.WHITE;

                // Date
                PdfPCell cellDate = new PdfPCell(new Paragraph(tx.getDate().toString(), bodyFont));
                cellDate.setBackgroundColor(bg);
                cellDate.setPadding(6f);
                cellDate.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cellDate);

                // Description
                PdfPCell cellDesc = new PdfPCell(new Paragraph(tx.getDescription() != null ? tx.getDescription() : "", bodyFont));
                cellDesc.setBackgroundColor(bg);
                cellDesc.setPadding(6f);
                table.addCell(cellDesc);

                // Category
                PdfPCell cellCat = new PdfPCell(new Paragraph(tx.getCategory().getName(), bodyFont));
                cellCat.setBackgroundColor(bg);
                cellCat.setPadding(6f);
                table.addCell(cellCat);

                // Type
                PdfPCell cellType = new PdfPCell(new Paragraph(tx.getType().name(), bodyFont));
                cellType.setBackgroundColor(bg);
                cellType.setPadding(6f);
                cellType.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cellType);

                // Amount
                String amountStr = "Rs." + tx.getAmount().setScale(0, java.math.RoundingMode.HALF_UP).toString();
                Font amtFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, 
                        tx.getType() == TransactionType.INCOME ? new Color(16, 185, 129) : new Color(51, 65, 85));
                PdfPCell cellAmt = new PdfPCell(new Paragraph(amountStr, amtFont));
                cellAmt.setBackgroundColor(bg);
                cellAmt.setPadding(6f);
                cellAmt.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(cellAmt);

                // Sum tallies
                if (tx.getType() == TransactionType.INCOME) {
                    totalIncome = totalIncome.add(tx.getAmount());
                } else {
                    totalExpense = totalExpense.add(tx.getAmount());
                }
                index++;
            }

            document.add(table);

            // Summary Spacer
            Paragraph spacer = new Paragraph("\n");
            document.add(spacer);

            // Summaries Card Table
            PdfPTable sumTable = new PdfPTable(2);
            sumTable.setWidthPercentage(40);
            sumTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Font sumLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(100, 116, 139));
            Font sumValFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(15, 23, 42));

            // Income total
            sumTable.addCell(createSummaryCell("Total Inflow:", sumLabelFont, Element.ALIGN_LEFT));
            sumTable.addCell(createSummaryCell("Rs." + totalIncome.setScale(0, java.math.RoundingMode.HALF_UP).toString(), 
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(16, 185, 129)), Element.ALIGN_RIGHT));

            // Expense total
            sumTable.addCell(createSummaryCell("Total Outflow:", sumLabelFont, Element.ALIGN_LEFT));
            sumTable.addCell(createSummaryCell("Rs." + totalExpense.setScale(0, java.math.RoundingMode.HALF_UP).toString(), 
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(244, 63, 94)), Element.ALIGN_RIGHT));

            // Balance total
            BigDecimal balance = totalIncome.subtract(totalExpense);
            sumTable.addCell(createSummaryCell("Net Surplus:", sumLabelFont, Element.ALIGN_LEFT));
            sumTable.addCell(createSummaryCell("Rs." + balance.setScale(0, java.math.RoundingMode.HALF_UP).toString(), 
                    sumValFont, Element.ALIGN_RIGHT));

            document.add(sumTable);
            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private PdfPCell createSummaryCell(String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4f);
        cell.setHorizontalAlignment(alignment);
        return cell;
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportExcel(LocalDate start, LocalDate end) {
        User user = userService.getCurrentUser();
        List<Transaction> transactions = transactionRepository.findByUserAndDateBetweenOrderByDateDesc(user, start, end);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Transactions Ledger");

            // Fonts
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Headers
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Date", "Description", "Category", "Type", "Amount (INR)"};
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerStyle);
            }

            // Cell Styles
            CellStyle cellStyle = workbook.createCellStyle();
            cellStyle.setAlignment(HorizontalAlignment.LEFT);

            CellStyle amountStyleIncome = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font incFont = workbook.createFont();
            incFont.setColor(IndexedColors.GREEN.getIndex());
            incFont.setBold(true);
            amountStyleIncome.setFont(incFont);
            amountStyleIncome.setAlignment(HorizontalAlignment.RIGHT);

            CellStyle amountStyleExpense = workbook.createCellStyle();
            amountStyleExpense.setAlignment(HorizontalAlignment.RIGHT);

            // Date format style
            CreationHelper createHelper = workbook.getCreationHelper();
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-mm-dd"));
            dateStyle.setAlignment(HorizontalAlignment.CENTER);

            int rowIdx = 1;
            for (Transaction tx : transactions) {
                Row row = sheet.createRow(rowIdx++);

                // Date
                Cell dateCell = row.createCell(0);
                dateCell.setCellValue(tx.getDate().toString());
                dateCell.setCellStyle(dateStyle);

                // Desc
                Cell descCell = row.createCell(1);
                descCell.setCellValue(tx.getDescription() != null ? tx.getDescription() : "");
                descCell.setCellStyle(cellStyle);

                // Category
                Cell catCell = row.createCell(2);
                catCell.setCellValue(tx.getCategory().getName());
                catCell.setCellStyle(cellStyle);

                // Type
                Cell typeCell = row.createCell(3);
                typeCell.setCellValue(tx.getType().name());
                typeCell.setCellStyle(cellStyle);

                // Amount
                Cell amtCell = row.createCell(4);
                amtCell.setCellValue(tx.getAmount().doubleValue());
                amtCell.setCellStyle(tx.getType() == TransactionType.INCOME ? amountStyleIncome : amountStyleExpense);
            }

            // Auto-size columns
            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Fail to import data to Excel file: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportCSV(LocalDate start, LocalDate end) {
        User user = userService.getCurrentUser();
        List<Transaction> transactions = transactionRepository.findByUserAndDateBetweenOrderByDateDesc(user, start, end);

        StringBuilder csv = new StringBuilder();
        // Append Header
        csv.append("Date,Description,Category,Type,Amount\n");

        for (Transaction tx : transactions) {
            csv.append(tx.getDate().toString()).append(",")
               .append("\"").append(tx.getDescription() != null ? tx.getDescription().replace("\"", "\"\"") : "").append("\",")
               .append(tx.getCategory().getName()).append(",")
               .append(tx.getType().name()).append(",")
               .append("Rs.").append(tx.getAmount().setScale(0, java.math.RoundingMode.HALF_UP).toString())
               .append("\n");
        }

        return csv.toString().getBytes();
    }
}
