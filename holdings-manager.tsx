import { useState, useCallback } from "react";
import { usePortfolioRealtimeSync } from "@/hooks/useRealtimeSync";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  Search,
  Filter,
  MoreHorizontal,
  PieChart,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react";
import { 
  usePortfolioHoldings, 
  useCreateHolding, 
  useUpdateHolding, 
  useDeleteHolding 
} from "@/lib/financial-auth";
import { useToast } from "@/hooks/use-toast";

// Form validation schemas
const holdingFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol too long"),
  name: z.string().min(1, "Asset name is required").max(100, "Name too long"),
  assetClass: z.enum(['equity', 'bond', 'cash', 'property', 'commodity', 'alternative'], {
    errorMap: () => ({ message: "Please select an asset class" })
  }),
  sector: z.string().optional(),
  region: z.string().optional(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  averageCost: z.coerce.number().positive("Cost must be positive").optional(),
  currentPrice: z.coerce.number().positive("Current price must be positive"),
});

type HoldingFormData = z.infer<typeof holdingFormSchema>;

interface HoldingsManagerProps {
  portfolioId: string;
  portfolioName: string;
  clientName: string;
}

interface Holding {
  id: string;
  symbol: string;
  name: string;
  assetClass: string;
  sector?: string;
  region?: string;
  quantity: number;
  averageCost?: number;
  currentPrice: number;
  marketValue: number;
  unrealizedGainLoss?: number;
  weight: number;
}

interface HoldingsResponse {
  holdings: Holding[];
  summary: {
    totalValue: number;
    totalUnrealizedGainLoss: number;
    holdingCount: number;
    assetClassBreakdown: Record<string, { value: number; percentage: number }>;
  };
}

export default function HoldingsManager({ portfolioId, portfolioName, clientName }: HoldingsManagerProps) {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [deletingHolding, setDeletingHolding] = useState<Holding | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [assetClassFilter, setAssetClassFilter] = useState<string>("all");
  
  // Enable real-time portfolio synchronization
  const { events, emitPortfolioEvent } = usePortfolioRealtimeSync(portfolioId, undefined);

  // API hooks
  const { data: holdingsData, isLoading, error } = usePortfolioHoldings(portfolioId) as { 
    data: HoldingsResponse | undefined, 
    isLoading: boolean, 
    error: any 
  };
  const createHoldingMutation = useCreateHolding();
  const updateHoldingMutation = useUpdateHolding();
  const deleteHoldingMutation = useDeleteHolding();

  // Form setup
  const addForm = useForm<HoldingFormData>({
    resolver: zodResolver(holdingFormSchema),
    defaultValues: {
      symbol: "",
      name: "",
      assetClass: "equity",
      sector: "",
      region: "",
      quantity: 0,
      averageCost: undefined,
      currentPrice: 0,
    },
  });

  const editForm = useForm<HoldingFormData>({
    resolver: zodResolver(holdingFormSchema),
  });

  // Handle form submissions
  const handleAddHolding = async (data: HoldingFormData) => {
    try {
      const result = await createHoldingMutation.mutateAsync({
        portfolioId,
        ...data,
      });
      
      // Emit real-time event for holding addition
      emitPortfolioEvent('holding_added', {
        holdingData: { ...data, ...result },
        portfolioId,
        action: 'added'
      });
      
      toast({
        title: "Holding Added",
        description: `${data.symbol} has been added to the portfolio.`,
      });
      
      setIsAddModalOpen(false);
      addForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add holding",
        variant: "destructive",
      });
    }
  };

  const handleEditHolding = async (data: HoldingFormData) => {
    if (!editingHolding) return;
    
    try {
      const result = await updateHoldingMutation.mutateAsync({
        portfolioId,
        holdingId: editingHolding.id,
        ...data,
      });
      
      // Emit real-time event for holding update
      emitPortfolioEvent('portfolio_updated', {
        holdingData: { ...data, ...result },
        holdingId: editingHolding.id,
        action: 'updated'
      });
      
      toast({
        title: "Holding Updated",
        description: `${data.symbol} has been updated successfully.`,
      });
      
      setEditingHolding(null);
      editForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update holding",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHolding = async () => {
    if (!deletingHolding) return;
    
    try {
      await deleteHoldingMutation.mutateAsync({
        portfolioId,
        holdingId: deletingHolding.id,
      });
      
      toast({
        title: "Holding Deleted",
        description: `${deletingHolding.symbol} has been removed from the portfolio.`,
      });
      
      setDeletingHolding(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete holding",
        variant: "destructive",
      });
    }
  };

  // Open edit modal with holding data
  const openEditModal = (holding: Holding) => {
    setEditingHolding(holding);
    editForm.reset({
      symbol: holding.symbol,
      name: holding.name,
      assetClass: holding.assetClass as any,
      sector: holding.sector || "",
      region: holding.region || "",
      quantity: holding.quantity,
      averageCost: holding.averageCost || undefined,
      currentPrice: holding.currentPrice,
    });
  };

  // Filter holdings based on search and asset class
  const filteredHoldings = holdingsData?.holdings?.filter(holding => {
    const matchesSearch = holding.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         holding.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssetClass = assetClassFilter === "all" || holding.assetClass === assetClassFilter;
    return matchesSearch && matchesAssetClass;
  }) || [];

  // Get asset class badge variant
  const getAssetClassBadge = (assetClass: string) => {
    const variants = {
      equity: "default",
      bond: "secondary", 
      cash: "outline",
      property: "default",
      commodity: "secondary",
      alternative: "outline"
    } as const;
    return variants[assetClass as keyof typeof variants] || "outline";
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading holdings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading holdings: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{portfolioName}</CardTitle>
              <CardDescription>Client: {clientName}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(holdingsData?.summary?.totalValue || 0)}</div>
              <div className="flex items-center gap-1 text-sm">
                {(holdingsData?.summary?.totalUnrealizedGainLoss || 0) >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-600" />
                )}
                <span className={`${(holdingsData?.summary?.totalUnrealizedGainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(holdingsData?.summary?.totalUnrealizedGainLoss || 0)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-gray-900">{holdingsData?.summary?.holdingCount || 0}</div>
              <div className="text-sm text-gray-600">Holdings</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-600">
                {Object.keys(holdingsData?.summary?.assetClassBreakdown || {}).length}
              </div>
              <div className="text-sm text-gray-600">Asset Classes</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-green-600">
                {holdingsData?.summary?.assetClassBreakdown?.equity?.percentage?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-gray-600">Equity Allocation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Holdings</CardTitle>
              <CardDescription>Manage portfolio positions and allocations</CardDescription>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-holding">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holding
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Holding</DialogTitle>
                  <DialogDescription>
                    Add a new position to {portfolioName}
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(handleAddHolding)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="symbol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Symbol</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., VWRL" 
                                data-testid="input-symbol"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="assetClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asset Class</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-asset-class">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="equity">Equity</SelectItem>
                                <SelectItem value="bond">Bond</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="property">Property</SelectItem>
                                <SelectItem value="commodity">Commodity</SelectItem>
                                <SelectItem value="alternative">Alternative</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Vanguard FTSE All-World UCITS ETF" 
                              data-testid="input-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="sector"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sector (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Technology" 
                                data-testid="input-sector"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Global" 
                                data-testid="input-region"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={addForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.000001"
                                placeholder="100" 
                                data-testid="input-quantity"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="averageCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avg Cost</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.01"
                                placeholder="95.50" 
                                data-testid="input-average-cost"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="currentPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Price</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.01"
                                placeholder="108.75" 
                                data-testid="input-current-price"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddModalOpen(false)}
                        data-testid="button-cancel-add"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createHoldingMutation.isPending}
                        data-testid="button-submit-add"
                      >
                        {createHoldingMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Add Holding
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search holdings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-holdings"
              />
            </div>
            <Select value={assetClassFilter} onValueChange={setAssetClassFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-asset-class">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Asset Classes</SelectItem>
                <SelectItem value="equity">Equity</SelectItem>
                <SelectItem value="bond">Bond</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="commodity">Commodity</SelectItem>
                <SelectItem value="alternative">Alternative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Holdings Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Asset Class</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Market Value</TableHead>
                  <TableHead className="text-right">Gain/Loss</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHoldings.length > 0 ? (
                  filteredHoldings.map((holding) => (
                    <TableRow key={holding.id} data-testid={`row-holding-${holding.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium" data-testid={`text-symbol-${holding.id}`}>
                            {holding.symbol}
                          </div>
                          <div className="text-sm text-gray-600" data-testid={`text-name-${holding.id}`}>
                            {holding.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getAssetClassBadge(holding.assetClass)} data-testid={`badge-asset-class-${holding.id}`}>
                          {holding.assetClass.charAt(0).toUpperCase() + holding.assetClass.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" data-testid={`text-quantity-${holding.id}`}>
                        {holding.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right" data-testid={`text-avg-cost-${holding.id}`}>
                        {holding.averageCost ? formatCurrency(holding.averageCost) : '-'}
                      </TableCell>
                      <TableCell className="text-right" data-testid={`text-current-price-${holding.id}`}>
                        {formatCurrency(holding.currentPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium" data-testid={`text-market-value-${holding.id}`}>
                        {formatCurrency(holding.marketValue)}
                      </TableCell>
                      <TableCell className="text-right" data-testid={`text-gain-loss-${holding.id}`}>
                        <div className={`flex items-center justify-end gap-1 ${
                          (holding.unrealizedGainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(holding.unrealizedGainLoss || 0) >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {holding.unrealizedGainLoss ? formatCurrency(holding.unrealizedGainLoss) : '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" data-testid={`text-weight-${holding.id}`}>
                        {formatPercentage(holding.weight)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(holding)}
                            data-testid={`button-edit-${holding.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingHolding(holding)}
                            data-testid={`button-delete-${holding.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {searchQuery || assetClassFilter !== "all" 
                        ? "No holdings match your search criteria"
                        : "No holdings found. Add your first holding to get started."
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Holding Modal */}
      <Dialog open={!!editingHolding} onOpenChange={() => setEditingHolding(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Holding</DialogTitle>
            <DialogDescription>
              Update {editingHolding?.symbol} in {portfolioName}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditHolding)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., VWRL" 
                          data-testid="input-edit-symbol"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="assetClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Class</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-asset-class">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="bond">Bond</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="property">Property</SelectItem>
                          <SelectItem value="commodity">Commodity</SelectItem>
                          <SelectItem value="alternative">Alternative</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Vanguard FTSE All-World UCITS ETF" 
                        data-testid="input-edit-name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Technology" 
                          data-testid="input-edit-sector"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Global" 
                          data-testid="input-edit-region"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.000001"
                          placeholder="100" 
                          data-testid="input-edit-quantity"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="averageCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avg Cost</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="95.50" 
                          data-testid="input-edit-average-cost"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="currentPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="108.75" 
                          data-testid="input-edit-current-price"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingHolding(null)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateHoldingMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateHoldingMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Update Holding
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingHolding} onOpenChange={() => setDeletingHolding(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holding</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingHolding?.symbol} from {portfolioName}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHolding}
              disabled={deleteHoldingMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteHoldingMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}