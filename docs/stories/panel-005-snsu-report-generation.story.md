# User Story: SNSU Official Report Generation

**Story ID**: PANEL-005  
**Epic**: Panel Defense Critical Requirements  
**Priority**: CRITICAL  
**Story Points**: 9  
**Sprint**: Panel Compliance Sprint 3  

## User Story

**As an** event organizer or administrator  
**I want** to generate attendance reports in SNSU's official format with student photos and signatures  
**So that** I can submit proper documentation to the university that meets institutional standards and includes visual verification

## Background Context

The academic panel specifically requested that the system generate attendance reports in SNSU's official format, complete with student photos for easy verification. This is essential for institutional compliance and provides a professional document that can be submitted to university administration and used for official record-keeping.

## Acceptance Criteria

### Scenario 1: Official SNSU Report Generation
**Given** I am an organizer or admin with an event that has attendance records  
**When** I select "Generate Official Report" for that event  
**Then** the system should create a report with SNSU official letterhead  
**And** the report should include the university logo and proper header information  
**And** the report should display event details (name, date, time, venue)  
**And** the report should show generation timestamp and organizer information

### Scenario 2: Attendance Table with Photos and Signatures
**Given** I am generating an official report  
**When** the report is created  
**Then** it should include a table with all attendees  
**And** each row should show: student ID, full name, course, year, time in  
**And** each row should include the student's attendance photo (thumbnail size)  
**And** each row should include the student's digital signature (if provided)  
**And** the table should be professionally formatted with clear borders and spacing

### Scenario 3: Report Header and University Branding
**Given** I am generating an SNSU official report  
**When** the report is created  
**Then** the header should include the SNSU logo  
**And** should display "SURIGAO DEL NORTE STATE UNIVERSITY"  
**And** should show "Surigao City, Philippines" as the location  
**And** should have "OFFICIAL EVENT ATTENDANCE RECORD" as the document title  
**And** should use university-appropriate colors and typography

### Scenario 4: PDF Download and Print Optimization
**Given** an official report has been generated  
**When** I download the report  
**Then** it should be in PDF format  
**And** should be optimized for printing on standard letter/A4 paper  
**And** should maintain image quality for photos and signatures  
**And** should have proper margins and page breaks  
**And** should include page numbers if multiple pages

### Scenario 5: Event Summary and Statistics
**Given** I am generating an official report  
**When** the report includes event details  
**Then** it should show total number of attendees  
**And** should display the event date and time  
**And** should include the event venue/location  
**And** should show the report generation date and time  
**And** should include the name of the person who generated the report

### Scenario 6: Data Integrity and Verification
**Given** I have generated an official report  
**When** I review the report content  
**Then** all student data should match the attendance records exactly  
**And** photos should be clearly visible and properly sized  
**And** signatures should be legible and appropriately placed  
**And** timestamps should be accurate and properly formatted  
**And** no student data should be missing or corrupted

## Definition of Done

### Functional Requirements
- [ ] PDF report generation with SNSU official formatting
- [ ] Student photos embedded in attendance table
- [ ] Digital signatures included where available
- [ ] Professional university-branded document layout
- [ ] Accurate data transfer from attendance records to report

### Technical Requirements
- [ ] PDF generation library integration (jsPDF or similar)
- [ ] Image embedding for photos and signatures
- [ ] Print-optimized layout and formatting
- [ ] Error handling for missing images or data
- [ ] Unit tests for report generation functions

### UX Requirements
- [ ] One-click report generation from event management
- [ ] Clear download process with progress indicators
- [ ] Professional document appearance matching university standards
- [ ] Mobile-responsive report generation interface
- [ ] Print preview functionality

## Technical Specifications

### Report Generator Component
```jsx
const SNSUReportGenerator = ({ eventId, attendanceRecords, onComplete }) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const generateReport = async () => {
    setGenerating(true);
    setProgress(0);
    setError(null);
    
    try {
      // Load event data
      setProgress(10);
      const eventData = await api.events.getById(eventId);
      
      // Prepare report data
      setProgress(25);
      const reportData = await prepareReportData(eventData.data, attendanceRecords);
      
      // Generate PDF
      setProgress(50);
      const pdf = await createSNSUPDF(reportData);
      
      // Download file
      setProgress(90);
      const filename = `SNSU_Attendance_${eventData.data.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      setProgress(100);
      onComplete?.(filename);
    } catch (err) {
      setError('Failed to generate report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Official SNSU Report
          </h3>
          <p className="text-sm text-gray-600">
            Generate official university attendance record with photos
          </p>
        </div>
        <img src="/snsu-logo.png" alt="SNSU Logo" className="h-12" />
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      {generating && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Generating report...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="flex space-x-3">
        <Button 
          onClick={generateReport}
          disabled={generating || !attendanceRecords.length}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          {generating ? 'Generating...' : 'Generate Official Report'}
        </Button>
        <Button variant="outline" onClick={() => showReportPreview()}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Report will include: SNSU letterhead, event details, attendance table with photos and signatures, 
        and official formatting suitable for university submission.
      </div>
    </div>
  );
};
```

### PDF Generation Service
```javascript
const createSNSUPDF = async (reportData) => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Page dimensions
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Add SNSU header
  await addSNSUHeader(pdf, pageWidth, margin);
  
  // Add event information
  let yPosition = addEventInfo(pdf, reportData.event, margin, 60);
  
  // Add attendance table
  yPosition = await addAttendanceTable(pdf, reportData.attendance, margin, yPosition, contentWidth);
  
  // Add footer
  addReportFooter(pdf, reportData, pageWidth, pageHeight, margin);
  
  return pdf;
};

const addSNSUHeader = async (pdf, pageWidth, margin) => {
  // University logo
  try {
    const logoImg = await loadImage('/snsu-logo.png');
    pdf.addImage(logoImg, 'PNG', pageWidth/2 - 15, margin, 30, 30);
  } catch (error) {
    console.warn('Could not load SNSU logo:', error);
  }
  
  // University name and title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SURIGAO DEL NORTE STATE UNIVERSITY', pageWidth/2, margin + 35, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Surigao City, Philippines', pageWidth/2, margin + 42, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OFFICIAL EVENT ATTENDANCE RECORD', pageWidth/2, margin + 52, { align: 'center' });
  
  // Header border line
  pdf.setLineWidth(1);
  pdf.line(margin, margin + 56, pageWidth - margin, margin + 56);
};

const addEventInfo = (pdf, eventData, margin, yStart) => {
  let y = yStart + 10;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  
  // Event details in two columns
  const leftCol = margin;
  const rightCol = margin + 100;
  
  pdf.text('Event:', leftCol, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(eventData.title, leftCol + 20, y);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Venue:', rightCol, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(eventData.venue || 'SNSU Campus', rightCol + 20, y);
  
  y += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date:', leftCol, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(eventData.date).toLocaleDateString(), leftCol + 20, y);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Generated:', rightCol, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date().toLocaleDateString(), rightCol + 20, y);
  
  return y + 15;
};

const addAttendanceTable = async (pdf, attendanceData, margin, yStart, contentWidth) => {
  const tableHeaders = ['#', 'Student ID', 'Full Name', 'Course', 'Year', 'Time In', 'Photo', 'Signature'];
  const colWidths = [10, 25, 40, 35, 15, 20, 20, 20];
  
  let y = yStart;
  
  // Table header
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setFillColor(59, 130, 246); // Blue background
  pdf.setTextColor(255, 255, 255); // White text
  
  let x = margin;
  tableHeaders.forEach((header, index) => {
    pdf.rect(x, y, colWidths[index], 8, 'F');
    pdf.text(header, x + 2, y + 5);
    x += colWidths[index];
  });
  
  y += 8;
  pdf.setTextColor(0, 0, 0); // Reset to black text
  pdf.setFont('helvetica', 'normal');
  
  // Table rows
  for (let i = 0; i < attendanceData.length; i++) {
    const record = attendanceData[i];
    const rowHeight = 25; // Increased height for photos
    
    // Check if we need a new page
    if (y + rowHeight > pdf.internal.pageSize.height - 30) {
      pdf.addPage();
      y = 30;
    }
    
    // Alternating row colors
    if (i % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    
    // Row data
    x = margin;
    const rowData = [
      (i + 1).toString(),
      record.studentId,
      record.fullName,
      record.course,
      record.year,
      new Date(record.timeIn).toLocaleTimeString()
    ];
    
    rowData.forEach((data, colIndex) => {
      pdf.rect(x, y, colWidths[colIndex], rowHeight);
      if (data) {
        // Center text vertically in cell
        const textY = y + (rowHeight / 2) + 2;
        if (colWidths[colIndex] > 30) {
          // Wrap long text for wider columns
          const lines = pdf.splitTextToSize(data, colWidths[colIndex] - 4);
          pdf.text(lines, x + 2, textY - (lines.length * 2));
        } else {
          pdf.text(data, x + 2, textY);
        }
      }
      x += colWidths[colIndex];
    });
    
    // Photo column
    if (record.photoUrl) {
      try {
        const photoImg = await loadImage(record.photoUrl);
        pdf.addImage(photoImg, 'JPEG', x + 2, y + 2, colWidths[6] - 4, rowHeight - 4);
      } catch (error) {
        pdf.text('No photo', x + 2, y + rowHeight/2 + 2);
      }
    }
    pdf.rect(x, y, colWidths[6], rowHeight);
    x += colWidths[6];
    
    // Signature column
    if (record.signatureUrl) {
      try {
        const sigImg = await loadImage(record.signatureUrl);
        pdf.addImage(sigImg, 'PNG', x + 2, y + 2, colWidths[7] - 4, rowHeight - 4);
      } catch (error) {
        pdf.text('No sig', x + 2, y + rowHeight/2 + 2);
      }
    }
    pdf.rect(x, y, colWidths[7], rowHeight);
    
    y += rowHeight;
  }
  
  return y;
};

const addReportFooter = (pdf, reportData, pageWidth, pageHeight, margin) => {
  const footerY = pageHeight - 30;
  
  // Footer line
  pdf.setLineWidth(0.5);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  // Left side - generation info
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `Generated by EAS (Event Attendance System) | ${new Date().toLocaleString()}`,
    margin,
    footerY
  );
  
  // Right side - signature line
  pdf.text('Event Organizer Signature: ________________________', pageWidth - margin - 80, footerY);
  
  // Total attendees
  pdf.text(`Total Attendees: ${reportData.attendance.length}`, pageWidth/2, footerY, { align: 'center' });
};

const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};
```

### Report Data Preparation
```javascript
const prepareReportData = async (eventData, attendanceRecords) => {
  const processedAttendance = await Promise.all(
    attendanceRecords.map(async (record) => {
      // Ensure photo URLs are accessible
      let photoUrl = record.photoUrl;
      if (photoUrl && !photoUrl.startsWith('http')) {
        photoUrl = await convertToDataURL(photoUrl);
      }
      
      // Ensure signature URLs are accessible  
      let signatureUrl = record.signatureUrl;
      if (signatureUrl && !signatureUrl.startsWith('http')) {
        signatureUrl = await convertToDataURL(signatureUrl);
      }
      
      return {
        studentId: record.studentId,
        fullName: record.fullName,
        course: record.course,
        year: record.year,
        timeIn: record.timeIn,
        photoUrl,
        signatureUrl
      };
    })
  );
  
  return {
    event: {
      title: eventData.title,
      date: eventData.date,
      venue: eventData.venue,
      organizer: eventData.organizer
    },
    attendance: processedAttendance.sort((a, b) => a.fullName.localeCompare(b.fullName)),
    generatedAt: new Date().toISOString(),
    totalAttendees: processedAttendance.length
  };
};

const convertToDataURL = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Failed to convert image to data URL:', error);
    return null;
  }
};
```

## Design Specifications

### SNSU Report Visual Standards

**Header Design**:
- University logo: 30mm width, centered
- University name: 16pt bold, blue color (#1E40AF)
- Location: 12pt regular, gray color (#6B7280)
- Document title: 14pt bold, black color
- Header separator line: 1pt blue line

**Typography**:
- Headers: Helvetica Bold
- Body text: Helvetica Regular
- Font sizes: 16pt (title), 12pt (headers), 10pt (table), 8pt (footer)
- Line spacing: 1.2x for readability

**Table Design**:
- Header background: Blue (#3B82F6)
- Header text: White
- Alternating row colors: Light gray (#F8FAFC) and white
- Cell padding: 2mm all sides
- Border: 0.5pt black lines
- Photo/signature size: 20mm width, auto height

**Color Scheme**:
- Primary blue: #1E40AF (SNSU brand color)
- Secondary blue: #3B82F6 (table headers)
- Text black: #000000
- Text gray: #6B7280
- Background gray: #F8FAFC

### Page Layout

**Margins**: 20mm all sides  
**Content area**: 170mm width  
**Header space**: 60mm from top  
**Footer space**: 30mm from bottom  
**Table row height**: 25mm (to accommodate photos)

## Testing Strategy

### Unit Tests
```javascript
describe('SNSU Report Generation', () => {
  test('generates PDF with proper SNSU header', async () => {
    const reportData = {
      event: { title: 'Test Event', date: '2024-01-15' },
      attendance: []
    };
    
    const pdf = await createSNSUPDF(reportData);
    
    // Verify PDF was created
    expect(pdf).toBeDefined();
    expect(pdf.internal.pages.length).toBeGreaterThan(0);
  });
  
  test('includes all attendance records in table', async () => {
    const attendanceData = [
      {
        studentId: '2021-0001',
        fullName: 'John Doe',
        course: 'Computer Science',
        year: '3rd Year',
        timeIn: '2024-01-15T09:00:00Z',
        photoUrl: 'data:image/jpeg;base64,/9j/4AAQ...',
        signatureUrl: 'data:image/png;base64,iVBOR...'
      }
    ];
    
    const reportData = {
      event: { title: 'Test Event' },
      attendance: attendanceData
    };
    
    const pdf = await createSNSUPDF(reportData);
    
    // Would need to verify PDF content contains the attendance data
    expect(pdf).toBeDefined();
  });
});

describe('Report Data Preparation', () => {
  test('processes attendance records correctly', async () => {
    const rawRecords = [
      {
        studentId: '2021-0001',
        fullName: 'Jane Smith',
        course: 'Information Technology',
        year: '2nd Year',
        timeIn: '2024-01-15T10:30:00Z',
        photoUrl: '/uploads/photos/jane.jpg'
      }
    ];
    
    const eventData = {
      title: 'IT Workshop',
      date: '2024-01-15',
      venue: 'Computer Lab'
    };
    
    const result = await prepareReportData(eventData, rawRecords);
    
    expect(result.event.title).toBe('IT Workshop');
    expect(result.attendance).toHaveLength(1);
    expect(result.attendance[0].fullName).toBe('Jane Smith');
    expect(result.totalAttendees).toBe(1);
  });
});
```

### Integration Tests
```javascript
describe('Complete Report Generation Flow', () => {
  test('generates and downloads report from event page', async () => {
    const eventId = 123;
    const attendanceRecords = [
      { studentId: '2021-0001', fullName: 'Test Student' }
    ];
    
    // Mock API responses
    api.events.getById.mockResolvedValue({
      data: { title: 'Test Event', date: '2024-01-15' }
    });
    
    render(<SNSUReportGenerator eventId={eventId} attendanceRecords={attendanceRecords} />);
    
    fireEvent.click(screen.getByText('Generate Official Report'));
    
    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
    
    // Verify download was triggered
    expect(mockPDFSave).toHaveBeenCalledWith(
      expect.stringMatching(/SNSU_Attendance_.*\.pdf/)
    );
  });
});
```

### User Acceptance Tests

1. **Test Case**: Generate report for event with 50+ attendees
   - **Steps**: Open event with many attendees, generate report
   - **Expected**: Multi-page PDF with all attendees, proper page breaks

2. **Test Case**: Report includes all student photos and signatures
   - **Steps**: Generate report for event with complete attendance data
   - **Expected**: All photos visible in table, signatures properly sized

3. **Test Case**: Report prints correctly on standard paper
   - **Steps**: Generate report, open in PDF viewer, print
   - **Expected**: Professional appearance, readable text, images clear

## Error Handling

### Image Loading Failures
```javascript
const handleImageError = (imageUrl, imageType) => {
  console.warn(`Failed to load ${imageType}:`, imageUrl);
  
  // Placeholder for missing images
  switch (imageType) {
    case 'photo':
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNEMxOC4zNDMxIDI0IDE3IDIyLjY1NjkgMTcgMjFDMTcgMTkuMzQzMSAxOC4zNDMxIDE4IDIwIDE4QzIxLjY1NjkgMTggMjMgMTkuMzQzMSAyMyAyMUMyMyAyMi42NTY5IDIxLjY1NjkgMjQgMjAgMjRaIiBmaWxsPSIjOUIxMDZGIi8+CjxwYXRoIGQ9Ik0xMiAxNkMxMi41NTIzIDE2IDEzIDE1LjU1MjMgMTMgMTVDMTMgMTQuNDQ3NyAxMi41NTIzIDE0IDEyIDE0QzExLjQ0NzcgMTQgMTEgMTQuNDQ3NyAxMSAxNUMxMSAxNS41NTIzIDExLjQ0NzcgMTYgMTIgMTZaIiBmaWxsPSIjOUIxMDZGIi8+Cjx0ZXh0IHg9IjIwIiB5PSIzMiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIFBob3RvPC90ZXh0Pgo8L3N2Zz4K';
    case 'signature':
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA0MCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIFNpZ25hdHVyZTwvdGV4dD4KPC9zdmc+';
    default:
      return null;
  }
};
```

### PDF Generation Errors
```javascript
const handlePDFError = (error) => {
  const errorMessage = error.message || 'Unknown error occurred';
  
  // Log error for debugging
  console.error('PDF Generation Error:', error);
  
  // User-friendly error messages
  if (errorMessage.includes('memory')) {
    return 'Report is too large to generate. Try reducing the number of attendees or contact support.';
  } else if (errorMessage.includes('network')) {
    return 'Unable to load student photos. Please check your internet connection and try again.';
  } else if (errorMessage.includes('permission')) {
    return 'You do not have permission to generate reports for this event.';
  } else {
    return 'Failed to generate report. Please try again or contact support if the problem persists.';
  }
};
```

## Success Metrics

### Document Quality Metrics
- 100% of generated reports include SNSU official formatting
- >95% of student photos successfully embedded in reports
- >90% of signatures properly displayed in reports
- Zero formatting errors in university branding elements

### Performance Metrics
- Report generation completes within 30 seconds for events up to 100 attendees
- PDF file size <10MB for standard events
- Download success rate >99%
- Print quality maintains readability of all text and images

### Academic Compliance Metrics
- Panel requirement for "official SNSU format with photos" fully satisfied
- Reports meet university standards for official documentation
- Professional appearance suitable for institutional submission
- Proper university branding and formatting throughout

---

**Story Prepared By**: BMad Orchestrator  
**Brand Guidelines Review**: Required for SNSU visual standards compliance  
**Print Quality Testing**: Required for physical document verification  
**Panel Compliance**: CRITICAL for meeting institutional documentation requirements
