"use client";

import React, { useState } from 'react';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Search as SearchIcon, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

export function PropertySearchBar() {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { filters, updateFilters, handleSearch, isSearching } = usePropertySearch();
  const t = useTranslations('HeroSection');



  return (
    <div className="w-full bg-card rounded-lg shadow-md p-4 lg:p-6">
      <div className="space-y-4">
        {/* Location Search */}
        <div className="flex items-center gap-2">
          <MapPin className="text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder={t('search.locationPlaceholder')}
            aria-label={t('search.locationAriaLabel')}
            className="flex-1"
            value={filters.location || ''}
            onChange={(e) => updateFilters({ location: e.target.value })}
          />
        </div>

        {/* Date Range Picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">{t('search.dateRange.from')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {filters.dateRange?.from ? (
                    format(filters.dateRange.from, 'PPP')
                  ) : (
                    <span className="text-muted-foreground">{t('search.dateRange.from')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange?.from}
                  onSelect={(date) =>
                    updateFilters({
                      dateRange: {
                        from: date,
                        to: filters.dateRange?.to
                      }
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">{t('search.dateRange.to')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {filters.dateRange?.to ? (
                    format(filters.dateRange.to, 'PPP')
                  ) : (
                    <span className="text-muted-foreground">{t('search.dateRange.to')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange?.to}
                  onSelect={(date) =>
                    updateFilters({
                      dateRange: {
                        from: filters.dateRange?.from,
                        to: date
                      }
                    })
                  }
                  disabled={(date) => 
                    filters.dateRange?.from ? date < filters.dateRange.from : false
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Property Type Select */}
        <div>
          <Label className="text-sm font-medium mb-1.5 block">{t('search.propertyTypePlaceholder')}</Label>
          <Select
            value={filters.propertyType || 'all'}
            onValueChange={(value) => 
              updateFilters({ propertyType: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('search.propertyTypePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('search.allPropertyTypes')}</SelectItem>
              <SelectItem value="house">{t('propertyTypes.house')}</SelectItem>
              <SelectItem value="villa">{t('propertyTypes.villa')}</SelectItem>
              <SelectItem value="condo">{t('propertyTypes.condo')}</SelectItem>
              <SelectItem value="lot">{t('propertyTypes.lot')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Toggle */}
        <Button 
          variant="link" 
          className="text-muted-foreground hover:no-underline p-0"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          {isAdvancedOpen ? (
            <>
              {t('search.hideAdvanced')}
              <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              {t('search.showAdvanced')}
              <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>

        {/* Advanced Filters Section */}
        {isAdvancedOpen && (
          <div className="space-y-4 border-t pt-4 mt-2">
            {/* Beds & Baths */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">{t('search.bedrooms')}</Label>
                <Select
                  value={filters.beds ? filters.beds.toString() : 'any'}
                  onValueChange={(value) => 
                    updateFilters({ beds: value === 'any' ? undefined : Number(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('search.anyBeds')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('search.anyBeds')}</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-1.5 block">{t('search.bathrooms')}</Label>
                <Select
                  value={filters.baths ? filters.baths.toString() : 'any'}
                  onValueChange={(value) => 
                    updateFilters({ baths: value === 'any' ? undefined : Number(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('search.anyBaths')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('search.anyBaths')}</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Min Price</Label>
                <Input
                  type="number"
                  placeholder="Min $"
                  value={filters.minPrice || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : Number(e.target.value);
                    updateFilters({ minPrice: value });
                  }}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-1.5 block">Max Price</Label>
                <Input
                  type="number"
                  placeholder="Max $"
                  value={filters.maxPrice || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : Number(e.target.value);
                    updateFilters({ maxPrice: value });
                  }}
                />
              </div>
            </div>

            {/* Pet-friendly Option */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pets-allowed"
                checked={filters.petsAllowed === true}
                onCheckedChange={(checked) => {
                  updateFilters({ petsAllowed: checked === true ? true : undefined });
                }}
              />
              <Label 
                htmlFor="pets-allowed"
                className="text-sm font-medium cursor-pointer"
              >
                {t('search.petsAllowedOnly')}
              </Label>
            </div>
          </div>
        )}

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          disabled={isSearching}
          className="w-full"
          size="lg"
        >
          {isSearching ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">⟳</span> {t('search.loading')}
            </span>
          ) : (
            <>
              <SearchIcon className="mr-2 h-4 w-4" /> {t('search.button')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
