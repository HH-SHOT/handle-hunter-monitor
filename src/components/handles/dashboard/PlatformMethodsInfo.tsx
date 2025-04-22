
import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const platformMethodsData = [
  {
    platform: 'Twitter',
    isOptimal: true,
    checkMethod: 'API-based',
    notes: 'Official API gives accurate results with proper error codes. Ideal.',
  },
  {
    platform: 'Instagram',
    isOptimal: false,
    checkMethod: 'Unofficial (URL probing)',
    notes: 'No public API for username check. URL probing is common practice. But prone to rate-limits and blocking.',
  },
  {
    platform: 'TikTok',
    isOptimal: false,
    checkMethod: 'Unofficial (URL probing)',
    notes: 'Same as Instagram: URL probing is reliable short-term, but lacks stability at scale.',
  },
  {
    platform: 'Twitch',
    isOptimal: true,
    checkMethod: 'API-based',
    notes: 'Official Helix API is fast, reliable, and accurate. Ideal.',
  },
];

const PlatformMethodsInfo: React.FC = () => {
  return (
    <Accordion type="single" collapsible className="w-full mb-4">
      <AccordionItem value="check-methods">
        <AccordionTrigger className="text-sm font-medium">
          Platform Check Methods
        </AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Is this optimal?</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Why / Why not</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformMethodsData.map((platform) => (
                <TableRow key={platform.platform}>
                  <TableCell className="font-medium">{platform.platform}</TableCell>
                  <TableCell>
                    {platform.isOptimal ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        <span>Yes</span>
                      </div>
                    ) : (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center text-amber-600 cursor-help">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span>Best possible</span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <p className="text-sm">
                            This platform doesn't provide an official API for username checks.
                            We're using the best available method.
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </TableCell>
                  <TableCell>{platform.checkMethod}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-600">{platform.notes}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PlatformMethodsInfo;
