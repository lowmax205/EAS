# 🎨 Advanced UI Components

### 1. Real-time Data Table with Filters
```typescript
interface AttendanceTableProps {
  data: AttendanceRecord[];
  realTimeUpdates: boolean;
  filters: FilterConfig[];
  onExport: (format: 'csv' | 'pdf') => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  data,
  realTimeUpdates,
  filters,
  onExport
}) => {
  return (
    <div className="overflow-x-auto">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Select placeholder="Filter by Department" />
        <DateRangePicker placeholder="Select Date Range" />
        <SearchInput placeholder="Search student name..." />
      </div>
      
      {/* Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => (
            <TableRow key={record.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={record.student.photo} />
                  <div>
                    <p className="font-medium">{record.student.name}</p>
                    <p className="text-sm text-gray-500">{record.student.id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{record.student.department}</TableCell>
              <TableCell>{formatTime(record.timestamp)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Badge variant="success">📍 GPS</Badge>
                  <Badge variant="success">📸 Photo</Badge>
                  <Badge variant="success">✍️ Signature</Badge>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">⚙️</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Download Photos</DropdownMenuItem>
                    <DropdownMenuItem>Remove Record</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Showing {startIndex}-{endIndex} of {totalRecords} records
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};
```

### 2. Interactive Analytics Charts (EAS Theme + Simple Polling)
```typescript
interface AnalyticsChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line' | 'pie';
  realTime: boolean;
  title: string;
  refreshInterval?: number; // Default: 10000ms (10 seconds)
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  type,
  realTime,
  title,
  refreshInterval = 10000
}) => {
  const [chartData, setChartData] = useState(data);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simple polling implementation (no WebSocket complexity)
  useEffect(() => {
    if (!realTime) return;
    
    const interval = setInterval(async () => {
      setIsUpdating(true);
      try {
        const newData = await fetchLatestData();
        setChartData(newData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to update chart data:', error);
      } finally {
        setIsUpdating(false);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [realTime, refreshInterval]);

  return (
    <Card className="p-6 bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-foreground">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {realTime && (
            <Badge 
              variant={isUpdating ? "secondary" : "default"}
              className={cn(
                isUpdating 
                  ? "bg-secondary/20 text-secondary-foreground animate-pulse" 
                  : "bg-primary/10 text-primary border-primary/20"
              )}
            >
              {isUpdating ? "🔄 Updating..." : "🟢 Live"}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          {type === 'bar' && (
            <Bar
              data={formatBarData(chartData)}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: 'hsl(var(--foreground))'
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { 
                      display: true, 
                      text: 'Number of Check-ins',
                      color: 'hsl(var(--foreground))'
                    },
                    ticks: {
                      color: 'hsl(var(--muted-foreground))'
                    },
                    grid: {
                      color: 'hsl(var(--border))'
                    }
                  },
                  x: {
                    title: { 
                      display: true, 
                      text: 'Time Period',
                      color: 'hsl(var(--foreground))'
                    },
                    ticks: {
                      color: 'hsl(var(--muted-foreground))'
                    },
                    grid: {
                      color: 'hsl(var(--border))'
                    }
                  }
                },
                // EAS Green color scheme
                backgroundColor: [
                  'hsl(var(--primary))', // EAS green bars
                  'hsl(var(--primary) / 0.8)',
                  'hsl(var(--primary) / 0.6)'
                ],
                borderColor: 'hsl(var(--primary))',
                borderWidth: 1
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

### 3. Camera Integration Component (Raw Quality, EAS Theme)
```typescript
interface CameraCaptureProps {
  mode: 'front' | 'back';
  onCapture: (imageBlob: Blob) => void;
  onError: (error: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  mode,
  onCapture,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode === 'front' ? 'user' : 'environment',
          width: { ideal: 1920 }, // High resolution for raw quality
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      onError('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Full resolution capture
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (context) {
      context.drawImage(video, 0, 0);
      
      // Raw quality - no compression (quality = 1.0)
      canvas.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
        }
        setIsCapturing(false);
      }, 'image/jpeg', 1.0); // Maximum quality, no compression
    }
  };

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="relative bg-card rounded-lg overflow-hidden border-2 border-primary/20">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-64 object-cover bg-secondary-900"
        onLoadedMetadata={startCamera}
      />
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* EAS Themed Camera Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            // Flip camera logic
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            setStream(null);
            startCamera();
          }}
          className={cn(
            "bg-card/90 backdrop-blur border-primary/30",
            "hover:bg-primary/10 hover:border-primary/50",
            "text-foreground"
          )}
        >
          🔄 Flip
        </Button>
        
        <Button
          size="lg"
          onClick={capturePhoto}
          disabled={isCapturing}
          className={cn(
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "border-primary shadow-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isCapturing ? '⏳ Capturing...' : '📸 Capture'}
        </Button>
      </div>
      
      {/* EAS Themed Camera Overlay Guide */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={cn(
          "w-full h-full border-2 border-dashed border-primary/50 rounded-lg",
          "flex items-center justify-center"
        )}>
          <p className={cn(
            "text-white bg-black/70 px-3 py-1 rounded text-sm",
            "font-medium shadow-lg"
          )}>
            Position your face clearly in the frame
          </p>
        </div>
      </div>
      
      {/* Mobile-only notice */}
      <div className="absolute top-2 right-2">
        <Badge variant="outline" className="bg-card/90 backdrop-blur">
          📱 Mobile Only
        </Badge>
      </div>
    </div>
  );
};
```

---
