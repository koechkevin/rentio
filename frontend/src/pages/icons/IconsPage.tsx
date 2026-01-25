import {
  Activity,
  Airplay,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Anchor,
  Aperture,
  Archive,
  ArrowDown,
  ArrowDownCircle,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowLeftCircle,
  ArrowRight,
  ArrowRightCircle,
  ArrowUp,
  ArrowUpCircle,
  ArrowUpLeft,
  ArrowUpRight,
  AtSign,
  Award,
  BarChart,
  BarChart2,
  Battery,
  BatteryCharging,
  Bell,
  BellOff,
  Bluetooth,
  Bold,
  Book,
  Bookmark,
  BookOpen,
  Box,
  Briefcase,
  Calendar,
  Camera,
  CameraOff,
  Cast,
  Check,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronUp,
  Chrome,
  Clipboard,
  Clock,
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudOff,
  CloudRain,
  CloudSnow,
  Code,
  Codepen,
  Codesandbox,
  Coffee,
  Columns,
  Command,
  Compass,
  Copy,
  CornerDownLeft,
  CornerDownRight,
  CornerLeftDown,
  CornerLeftUp,
  CornerRightDown,
  CornerRightUp,
  CornerUpLeft,
  CornerUpRight,
  Cpu,
  CreditCard,
  Crop,
  Crosshair,
  Database,
  Delete,
  Disc,
  DollarSign,
  Download,
  DownloadCloud,
  Droplet,
  Edit,
  Edit2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  FastForward,
  Feather,
  Figma,
  File,
  FileMinus,
  FilePlus,
  FileText,
  Film,
  Filter,
  Flag,
  Folder,
  FolderMinus,
  FolderPlus,
  Frown,
  Gift,
  GitBranch,
  GitCommit,
  Github,
  Gitlab,
  GitMerge,
  GitPullRequest,
  Globe,
  Grid,
  HardDrive,
  Hash,
  Headphones,
  Heart,
  HelpCircle,
  Hexagon,
  Home,
  Image,
  Inbox,
  Info,
  Instagram,
  Italic,
  Key,
  Layers,
  Layout,
  LifeBuoy,
  Link2,
  Linkedin,
  LinkIcon,
  List,
  Loader,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapIcon,
  MapPin,
  Maximize,
  Maximize2,
  Minus,
  MinusCircle,
  MinusSquare,
  Monitor,
  Moon,
  MoreHorizontal,
  MoreVertical,
  MousePointer,
  Move,
  Music,
  Navigation,
  Navigation2,
  Octagon,
  Package,
  Paperclip,
  Pause,
  PauseCircle,
  PenTool,
  Percent,
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  PieChart,
  Play,
  PlayCircle,
  Plus,
  PlusCircle,
  PlusSquare,
  Pocket,
  Power,
  Printer,
  Radio,
  RefreshCcw,
  RotateCw,
  Rss,
  Save,
  Scissors,
  Search,
  Send,
  Server,
  Settings,
  Share,
  Share2,
  Shield,
  ShieldOff,
  ShoppingBag,
  ShoppingCart,
  Shuffle,
  Sidebar,
  SkipBack,
  SkipForward,
  Slack,
  Slash,
  Sliders,
  Smartphone,
  Smile,
  Speaker,
  Square,
  Star,
  StopCircle,
  Sun,
  Sunrise,
  Sunset,
  TableIcon,
  Tablet,
  Tag,
  Target,
  Terminal,
  Thermometer,
  ThumbsDown,
  ThumbsUp,
  ToggleLeft,
  ToggleRight,
  Trash,
  Trash2,
  Trello,
  TrendingDown,
  TrendingUp,
  Triangle,
  Truck,
  Tv,
  Twitter,
  Type,
  Umbrella,
  Underline,
  Unlock,
  Upload,
  UploadCloud,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
  Video,
  VideoOff,
  Voicemail,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Watch,
  Wifi,
  WifiOff,
  Wind,
  X,
  XCircle,
  XOctagon,
  XSquare,
  Youtube,
  Zap,
  ZapOff,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Breadcrumb, Card, Col, Container, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router';

const IconsPage = () => {
  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '.' }}>
          Icons
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Lucide Icons</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        <Col md={12} className="grid-margin stretch-card">
          <Card>
            <Card.Body>
              <Card.Title>Lucide Icons</Card.Title>
              <p className="text-secondary mb-2">
                Experience a clean and consistent icon set with{' '}
                <a href="https://lucide.dev/" target="_blank">
                  Lucide Icons
                </a>
                .
              </p>
              <p className="text-secondary mb-3">
                Explore{' '}
                <a href="https://lucide.dev/icons/" target="_blank">
                  full list of Icons
                </a>
                .
              </p>
              <Table bordered responsive className="mb-3">
                <tbody>
                  <tr>
                    <td>Example</td>
                    <td>Code</td>
                  </tr>
                  <tr>
                    <td>
                      <Gift size={30} />
                    </td>
                    <td>
                      <code>
                        import &#123; Gift &#125; from "lucide-react"
                        <hr />
                        &lt;Gift size=&#123;25&#125; /&gt;
                      </code>
                    </td>
                  </tr>
                </tbody>
              </Table>

              <Container fluid>
                <Row className="icons-list">
                  <Col sm={6} md={4} lg={3}>
                    <Activity /> activity
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Airplay /> airplay
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <AlertCircle /> alert-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <AlertOctagon /> alert-octagon
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <AlertTriangle /> alert-triangle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <AlignCenter /> align-center
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <AlignJustify /> align-justify
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <AlignLeft /> align-left
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <AlignRight /> align-right
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Anchor /> anchor
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Aperture /> aperture
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Archive /> archive
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowDownCircle /> arrow-down-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowDownLeft /> arrow-down-left
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowDownRight /> arrow-down-right
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowDown /> arrow-down
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowLeftCircle /> arrow-left-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowLeft /> arrow-left
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowRightCircle /> arrow-right-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowRight /> arrow-right
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowUpCircle /> arrow-up-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowUpLeft /> arrow-up-left
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowUpRight /> arrow-up-right
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ArrowUp /> arrow-up
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <AtSign /> at-sign
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Award /> award
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <BarChart2 /> bar-chart-2
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <BarChart /> bar-chart
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <BatteryCharging /> battery-charging
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Battery /> battery
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <BellOff /> bell-off
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Bell /> bell
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Bluetooth /> bluetooth
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Bold /> bold
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <BookOpen /> book-open
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Book /> book
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Bookmark /> bookmark
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Box /> box
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Briefcase /> briefcase
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Calendar /> calendar
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CameraOff /> camera-off
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Camera /> camera
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Cast /> cast
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CheckCircle /> check-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CheckSquare /> check-square
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Check /> check
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ChevronDown /> chevron-down
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ChevronLeft /> chevron-left
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ChevronRight /> chevron-right
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ChevronUp /> chevron-up
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ChevronsDown /> chevrons-down
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ChevronsLeft /> chevrons-left
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ChevronsRight /> chevrons-right
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ChevronsUp /> chevrons-up
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Chrome /> chrome
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Clipboard /> clipboard
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Clock /> clock
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CloudDrizzle /> cloud-drizzle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CloudLightning /> cloud-lightning
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CloudOff /> cloud-off
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CloudRain /> cloud-rain
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CloudSnow /> cloud-snow
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Cloud /> cloud
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Code /> code
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Codepen /> codepen
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Codesandbox /> codesandbox
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Coffee /> coffee
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Columns /> columns
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Command /> command
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Compass /> compass
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Copy /> copy
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CornerDownLeft /> corner-down-left
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CornerDownRight /> corner-down-right
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CornerLeftDown /> corner-left-down
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CornerLeftUp /> corner-left-up
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CornerRightDown /> corner-right-down
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CornerRightUp /> corner-right-up
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CornerUpLeft /> corner-up-left
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CornerUpRight /> corner-up-right
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Cpu /> cpu
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <CreditCard /> credit-card
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Crop /> crop
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Crosshair /> crosshair
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Database /> database
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Delete /> delete
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Disc /> disc
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <DollarSign /> dollar-sign
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <DownloadCloud /> download-cloud
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Download /> download
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Droplet /> droplet
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Edit2 /> edit-2
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Edit3 /> edit-3
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Edit /> edit
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ExternalLink /> external-link
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <EyeOff /> eye-off
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Eye /> eye
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Facebook /> facebook
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <FastForward /> fast-forward
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Feather /> feather
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Figma /> figma
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <FileMinus /> file-minus
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <FilePlus /> file-plus
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <FileText /> file-text
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <File /> file
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Film /> film
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Filter /> filter
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Flag /> flag
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <FolderMinus /> folder-minus
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <FolderPlus /> folder-plus
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Folder /> folder
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Frown /> frown
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Gift /> gift
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <GitBranch /> git-branch
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <GitCommit /> git-commit
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <GitMerge /> git-merge
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <GitPullRequest /> git-pull-request
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Github /> github
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Gitlab /> gitlab
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Globe /> globe
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Grid /> grid
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <HardDrive /> hard-drive
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Hash /> hash
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Headphones /> headphones
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Heart /> heart
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <HelpCircle /> help-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Hexagon /> hexagon
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Home /> home
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Image /> image
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Inbox /> inbox
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Info /> info
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Instagram /> instagram
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Italic /> italic
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Key /> key
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Layers /> layers
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Layout /> layout
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <LifeBuoy /> life-buoy
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Link2 /> link-2
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <LinkIcon /> link
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Linkedin /> linkedin
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <List /> list
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Loader /> loader
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Lock /> lock
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <LogIn /> log-in
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <LogOut /> log-out
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Mail /> mail
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <MapPin /> map-pin
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <MapIcon /> map-icon
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Maximize2 /> maximize-2
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Maximize /> maximize
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <MinusCircle /> minus-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <MinusSquare /> minus-square
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Minus /> minus
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Monitor /> monitor
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Moon /> moon
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <MoreHorizontal /> more-horizontal
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <MoreVertical /> more-vertical
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <MousePointer /> mouse-pointer
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Move /> move
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Music /> music
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Navigation2 /> navigation-2
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Navigation /> navigation
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Octagon /> octagon
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Package /> package
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Paperclip /> paperclip
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PauseCircle /> pause-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Pause /> pause
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PenTool /> pen-tool
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Percent /> percent
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PhoneCall /> phone-call
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PhoneForwarded /> phone-forwarded
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PhoneIncoming /> phone-incoming
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PhoneMissed /> phone-missed
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PhoneOff /> phone-off
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PhoneOutgoing /> phone-outgoing
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Phone /> phone
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PieChart /> pie-chart
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PlayCircle /> play-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Play /> play
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PlusCircle /> plus-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <PlusSquare /> plus-square
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Plus /> plus
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Pocket /> pocket
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Power /> power
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Printer /> printer
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Radio /> radio
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <RefreshCcw /> refresh-ccw
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <RotateCw /> rotate-cw
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Rss /> rss
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Save /> save
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Scissors /> scissors
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Search /> search
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Send /> send
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Server /> server
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Settings /> settings
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Share2 /> share-2
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Share /> share
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ShieldOff /> shield-off
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Shield /> shield
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ShoppingBag /> shopping-bag
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ShoppingCart /> shopping-cart
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Shuffle /> shuffle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Sidebar /> sidebar
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <SkipBack /> skip-back
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <SkipForward /> skip-forward
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Slack /> slack
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Slash /> slash
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Sliders /> sliders
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Smartphone /> smartphone
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Smile /> smile
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Speaker /> speaker
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Square /> square
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Star /> star
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <StopCircle /> stop-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Sun /> sun
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Sunrise /> sunrise
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Sunset /> sunset
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <TableIcon /> table-icon
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Tablet /> tablet
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Tag /> tag
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Target /> target
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Terminal /> terminal
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Thermometer /> thermometer
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ThumbsDown /> thumbs-down
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ThumbsUp /> thumbs-up
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ToggleLeft /> toggle-left
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ToggleRight /> toggle-right
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Trash2 /> trash-2
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Trash /> trash
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Trello /> trello
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <TrendingDown /> trending-down
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <TrendingUp /> trending-up
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Triangle /> triangle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Truck /> truck
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Tv /> tv
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Twitter /> twitter
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Type /> type
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Umbrella /> umbrella
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Underline /> underline
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Unlock /> unlock
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <UploadCloud /> upload-cloud
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Upload /> upload
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <UserCheck /> user-check
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <UserPlus /> user-plus
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <UserMinus /> user-minus
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <UserX /> user-x
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <User /> user
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Users /> users
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <VideoOff /> video-off
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Video /> video
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Voicemail /> voicemail
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Volume1 /> volume-1
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Volume2 /> volume-2
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <VolumeX /> volume-x
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Volume /> volume
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Watch /> watch
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <WifiOff /> wifi-off
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Wifi /> wifi
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Wind /> wind
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <XCircle /> x-circle
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <XOctagon /> x-octagon
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <XSquare /> x-square
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <X /> x
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Youtube /> youtube
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ZapOff /> zap-off
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <Zap /> zap
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ZoomIn /> zoom-in
                  </Col>
                  <Col sm={6} md={4} lg={3}>
                    <ZoomOut /> zoom-out
                  </Col>
                </Row>
              </Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default IconsPage;
